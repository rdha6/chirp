import { type GetStaticProps, type GetStaticPaths } from "next";
import Head from "next/head";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layouts";
import { PostView } from "~/components/postview";
import { generateServerSideHelper } from "~/server/helpers/ssgHelper";

// Component
const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data, isLoading } = api.posts.getById.useQuery({ id });

  if (isLoading) return <LoadingPage />;
  if (!data) return <div>404 - Post not found</div>;

  return (
    <>
      <Head>
      <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

// SSG
export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id;

  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  // Use createInnerTRPCContext here, no req/res needed during SSG
  const ssg = await generateServerSideHelper();

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: id,
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SinglePostPage;
