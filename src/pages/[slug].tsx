import { type GetStaticProps, type GetStaticPaths } from "next";
import Head from "next/head";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";  // use this for SSG
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layouts";
import Image from "next/image";
import { PostView } from "~/components/postview";

// Component
const ProfileFeed = (props: {userId: string}) => {
  const {data, isLoading} = api.posts.getPostsByUserId.useQuery({userId: props.userId})

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return <div className="flex flex-col">
    {data.map(fullPost => (
      <PostView {...fullPost} key={fullPost.post.id} />))}
  </div>
}

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({ username });

  if (isLoading) return <LoadingPage />;
  if (!data) return <div>404 - User not found</div>;

  return (
    <>
      <Head>
      <title>{data.username}&apos;s Profile</title>
      </Head>
      <PageLayout>
        <div className="bg-slate-600 h-36 relative">
        <Image
          src={data.profileImageUrl}
          alt={`${data.username ?? ""}'s profile pic`}
          width={128}
          height={128}
          className="rounded-full border-4 border-black -mb-[64px] absolute bottom-0 left-0 ml-4 bg-black"
        />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.username}`}</div>
        <div className="border-b border-slate-400 w-full" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export default ProfilePage;

// SSG
export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    return {
      notFound: true,
    };
  }

  const username = slug.replace("@", "");
  // Use createInnerTRPCContext here, no req/res needed during SSG
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createInnerTRPCContext(),
    transformer: superjson,
  });

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username: username,
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
