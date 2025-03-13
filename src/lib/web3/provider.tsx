"use client";

import { wagmiAdapter, projectId, networks } from "@/lib/web3/config";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum, huddle01Testnet } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "Pong01",
  description: "Pong01",
  url: "https://appkitexampleapp.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [huddle01Testnet, mainnet],
  defaultNetwork: huddle01Testnet,
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
