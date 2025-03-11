"use client";

import { Button } from "./ui/button";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useSignMessage } from "wagmi";
import { env } from "@/env";
import useAuthState, { EAuthState } from "@/hooks/useAuthState";
import { login } from "@/lib/action";

const message = env.NEXT_PUBLIC_SIGN_MESSAGE;

const SignInWithWallet = () => {
  const { authState, setAuthState } = useAuthState();
  const { open } = useAppKit();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const handleClick = async () => {
    if (!address) return open({ view: "Connect" });
    setAuthState(EAuthState.SIGNING);
    const signature = await signMessageAsync({ message });
    setAuthState(EAuthState.SIGNED);
    await login({ address, signature, message });
  };
  return (
    <Button className="" onClick={handleClick}>
      {authState === EAuthState.DISCONNECTED
        ? "Connect Wallet"
        : authState === EAuthState.CONNECTING
          ? "Connecting..."
          : authState === EAuthState.CONNECTED
            ? "Sign Message"
            : authState === EAuthState.SIGNING
              ? "Signing..."
              : authState === EAuthState.SIGNED
                ? "Signed"
                : authState === EAuthState.ERROR
                  ? "Error"
                  : null}
    </Button>
  );
};

export default SignInWithWallet;
