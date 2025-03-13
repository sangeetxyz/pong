import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "./_components/theme";
import ReownProvider from "@/lib/web3/provider";
import { cookies as nextCookies } from "next/headers";
import { Toaster } from "./_components/ui/sonner";

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "black" }],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pong01.vercel.app"),
  title: "Pong01",
  description:
    "Play Pong01 and earn Pong Tokens. Compete with other players and win rewards.",
  twitter: {
    card: "summary_large_image",
    site: "@huddle01com",
    creator: "@huddle01com",
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await nextCookies();
  const cookies = cookieStore.get("cookies")?.value ?? null;
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ReownProvider cookies={cookies}>
          <ThemeProvider attribute="class" forcedTheme="dark">
            {children}
            <Toaster />
          </ThemeProvider>
        </ReownProvider>
      </body>
    </html>
  );
}
