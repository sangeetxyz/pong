"use server";

import { signIn, signOut } from "@/server/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

interface Props {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
}

export const login = async ({ address, signature, message }: Props) => {
  try {
    await signIn("wallet", {
      address,
      signature,
      message,
    });
  } catch (error: unknown) {
    if (isRedirectError(error)) {
      throw error;
    }
    throw error;
  } finally {
    redirect("/");
  }
};

export const logout = async () => {
  try {
    await signOut({ redirect: false });
  } catch (error: unknown) {
    console.error(error);
    throw error;
  } finally {
    redirect("/signin");
  }
};
