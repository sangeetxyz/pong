"use server";

import { signIn, signOut } from "@/server/auth";
import { api } from "@/trpc/server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Address } from "viem";

interface Props {
  address: Address;
  signature: Address;
  message: string;
}

export const login = async ({ address, signature, message }: Props) => {
  try {
    await signIn("wallet", {
      address,
      signature,
      message,
    });
    console.log("login success");
  } catch (error: unknown) {
    if (isRedirectError(error)) {
      console.error("redirect error");
    }

    console.error(error);
  }
};

export const logout = async () => {
  try {
    await signOut({ redirect: false });
  } catch (error: unknown) {
    console.error(error);
    throw error;
  }
};

type TGetToken = {
  score: number;
  startTime: number;
  endTime: number;
  count: number;
};

export const getToken = async (params: TGetToken) => {
  const res = await api.token.get(params);
  return res;
};
