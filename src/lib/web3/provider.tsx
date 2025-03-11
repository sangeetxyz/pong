"use client";

import { wagmiAdapter, projectId } from "@/lib/web3/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "appkit-example",
  description: "AppKit Example",
  url: "https://appkitexampleapp.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet,
  metadata: metadata,
});

function ReownProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies);

  return (
    <SessionProvider>
      <TRPCReactProvider>
        <WagmiProvider
          config={wagmiAdapter.wagmiConfig}
          initialState={initialState}
        >
          {children}
        </WagmiProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
}

export default ReownProvider;
