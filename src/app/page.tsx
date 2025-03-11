import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import SignInButton from "./_components/SignInButton";
import SignOutButton from "./_components/SignOutButton";
import SignInWithWallet from "./_components/SignInWithWallet";
import { redirect } from "next/navigation";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (!session) redirect("/signin");

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <div className="flex h-screen flex-col items-center justify-center">
        {session.user.id} <SignOutButton />
      </div>
    </HydrateClient>
  );
}
