import type { DefaultSession, NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import type { AdapterUser } from "next-auth/adapters";
import { WalletProvider } from "./walletProvider";
import type { Address } from "viem";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

export type TUser = {
  id: Address;
};

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: TUser;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

const providers: Provider[] = [WalletProvider];

export const authConfig = {
  providers,
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    session({ session, token }) {
      session.user = token.user as AdapterUser & TUser;
      return session;
    },
  },
  pages: {
    signIn: "/signin", // custom sign in page
  },
} satisfies NextAuthConfig;

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    }
    return { id: provider.id, name: provider.name };
  })
  .filter((provider) => provider.id !== "credentials");
