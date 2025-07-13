// import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { useState } from "react";

import { LoadingPage, LoadingSpinner } from "~/components/loading";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layouts";
import { PostView } from "~/components/postview";
// import { ZodError } from "zod";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isPending: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");           // clear input after successful post
      void ctx.posts.getAll.invalidate(); // refresh post feed
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
      toast.error("Post failed");
      }
    },
  });

  console.log(user);
  
  if (!user) return null;

  return (
    <div className="flex gap-3 w-full">
      <Image 
        src={user.imageUrl} 
        alt="Profile Image" 
        width={56} 
        height={56}
        className="w-14 h-14 rounded-full"
      />
      <input 
        type="text" 
        placeholder="Type some emojis!" 
        className="bg-transparent grow outline-none" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (<button onClick={() => mutate({ content: input })}>Post</button>)}
      {isPosting && <div className="flex items-center justify-center"><LoadingSpinner size={20}/></div>}
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>

  return ( 
  <div className="flex flex-col">
    {data.map((fullPost) => (<PostView key={fullPost.post.id} {...fullPost} />))}
  </div>)

}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />

  return (
  <PageLayout>
    <div className="flex border-b border-slate-400 p-4">
    {!isSignedIn && (
      <SignInButton>
        <button className="flex justify-center items-center">Sign In</button>
      </SignInButton>
    )}
    {isSignedIn && <CreatePostWizard />}
    </div>
  <Feed /></PageLayout>
  );
};

export default Home;
