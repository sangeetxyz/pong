"use client";

import { Button } from "../ui/button";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useDisconnect, useSignMessage } from "wagmi";
import { env } from "@/env";
import useAuth, { EAuthState } from "@/hooks/useAuth";
import { login, logout } from "@/lib/action";
import { truncateAddress } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { useState } from "react";
import type { Address } from "viem";
import { getSession, useSession } from "next-auth/react";

const message = env.NEXT_PUBLIC_SIGN_MESSAGE;

const Wallet = () => {
  const { authState, setAuthState, user } = useAuth();
  const { update } = useSession();
  const { address } = useAppKitAccount();
  const { open } = useAppKit();
  const { signMessageAsync } = useSignMessage();
  const [isOpen, setIsOpen] = useState(false);
  const { disconnectAsync } = useDisconnect();

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
        return truncateAddress(user?.id);
      case EAuthState.ERROR:
        return "Error";
      default:
        return null;
    }
  };

  const handleDisconnect = async () => {
    await disconnectAsync();
    await logout();
    await getSession();
    setIsOpen(false);
  };

  return (
    <div>
      <Button variant={"secondary"} className="" onClick={handleClick}>
        {buttonText()}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Button onClick={handleDisconnect}>Disconnect</Button>
            <div>{user?.id}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallet;
