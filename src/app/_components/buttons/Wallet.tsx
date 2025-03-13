"use client";

import { Button } from "../ui/button";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useDisconnect, useSignMessage } from "wagmi";
import { env } from "@/env";
import useAuth, { EAuthState } from "@/hooks/useAuth";
import { login, logout } from "@/lib/action";
import {
  cn,
  formatLargeNumber,
  formatSeconds,
  truncateAddress,
} from "@/lib/utils";
import { SiWalletconnect } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { useReadContract } from "wagmi";
import { type FC, memo, useEffect, useState } from "react";
import { formatEther, type Address } from "viem";
import { getSession, useSession } from "next-auth/react";
import Image from "next/image";
import CopyButton from "./CopyButton";
import { PongTokenABI } from "@/common/abis";
import { huddle01Testnet } from "viem/chains";
import { api } from "@/trpc/react";

const message = env.NEXT_PUBLIC_SIGN_MESSAGE;

type TWalletProps = {
  className?: string;
};

const Wallet: FC<TWalletProps> = memo(({ className }) => {
  const { authState, setAuthState, user } = useAuth();
  const { update } = useSession();
  const { address } = useAppKitAccount();
  const { open } = useAppKit();
  const { signMessageAsync } = useSignMessage();
  const [isOpen, setIsOpen] = useState(false);
  const { disconnectAsync } = useDisconnect();
  const { data: userDetails, refetch: refetchUserDetails } =
    api.token.getUserDetails.useQuery();

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    abi: PongTokenABI,
    address: env.NEXT_PUBLIC_PONGTOKEN_ADDRESS as Address,
    functionName: "balanceOf",
    args: user ? [user.id] : undefined,
    chainId: huddle01Testnet.id,
  });

  const handleClick = async () => {
    if (!address && !user?.id) return open({ view: "Connect" });
    if (authState === EAuthState.SIGNED) return setIsOpen(true);
    if (authState === EAuthState.CONNECTED) {
      setAuthState(EAuthState.SIGNING);
      const signature = await signMessageAsync({ message });
      setAuthState(EAuthState.SIGNED);
      await login({
        address: address as Address,
        signature,
        message,
      });
      await update();
    }
  };

  const buttonText = () => {
    switch (authState) {
      case EAuthState.DISCONNECTED:
        return "Connect Wallet";
      case EAuthState.CONNECTING:
        return "Connecting...";
      case EAuthState.CONNECTED:
        return "Sign Message";
      case EAuthState.SIGNING:
        return "Signing...";
      case EAuthState.SIGNED:
        return user ? truncateAddress(user.id) : "Loading...";
      case EAuthState.ERROR:
        return "Error";
      default:
        return "Loading...";
    }
  };

  const handleDisconnect = async () => {
    await disconnectAsync();
    await logout();
    await getSession();
    setIsOpen(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    void refetchUserDetails();
    void refetchTokenBalance();
  }, [isOpen, refetchUserDetails, refetchTokenBalance]);

  return (
    <>
      <Button
        className={cn(className)}
        variant={authState === EAuthState.SIGNED ? "secondary" : "default"}
        onClick={handleClick}
      >
        <SiWalletconnect
          className={cn({
            "text-lime-500": authState === EAuthState.SIGNED,
          })}
        />
        {buttonText()}
      </Button>
      {user?.id && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="w-96 bg-zinc-950/50 p-4 backdrop-blur-lg">
            <DialogHeader className="hidden">
              <DialogTitle>{}</DialogTitle>
              <DialogDescription>{}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <div className="relative flex justify-start">
                <Image
                  src={"/hud.png"}
                  alt=""
                  height={50}
                  width={40}
                  className="h-6 object-contain"
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="mb-2 size-24 rounded-full border p-1">
                  <Image
                    src={`/api/blockie/${user.id}`}
                    alt=""
                    height={500}
                    width={500}
                    className="rounded-full object-contain"
                  />
                </div>
                <div className="relative text-xl font-bold text-zinc-300">
                  {truncateAddress(user.id)}
                  <CopyButton
                    text={user.id}
                    className="absolute -right-6 top-2"
                  />
                </div>
                {tokenBalance && (
                  <div className="text-xs">
                    {formatEther(tokenBalance)}{" "}
                    <span className="text-lime-400">$PONG</span>
                  </div>
                )}
              </div>
              {userDetails && (
                <div className="flex space-x-4">
                  <div className="flex w-full flex-col items-center space-y-1 rounded-2xl border bg-zinc-900 p-2">
                    <div className="whitespace-nowrap text-xs text-zinc-400">
                      Highest Score
                    </div>
                    <div className="text-xl font-bold text-lime-400">
                      {formatLargeNumber(userDetails.highScore)}
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-center space-y-1 rounded-2xl border bg-zinc-900 p-2">
                    <div className="whitespace-nowrap text-xs text-zinc-400">
                      Longest Survival
                    </div>
                    <div className="text-center text-xl font-bold text-lime-400">
                      {formatSeconds(userDetails.longestSurvival)}
                    </div>
                  </div>
                </div>
              )}
              <Button onClick={handleDisconnect}>Disconnect</Button>
              {/* <div>{user?.id}</div> */}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});

Wallet.displayName = "Wallet";

export default Wallet;
