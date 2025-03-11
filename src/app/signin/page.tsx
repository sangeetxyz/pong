import React from "react";
import SignInWithWallet from "../_components/SignInWithWallet";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

const SignInPage = async () => {
  const session = await auth();
  if (session) redirect("/");
  return (
    <div className="flex h-screen items-center justify-center">
      <SignInWithWallet />
    </div>
  );
};

export default SignInPage;
