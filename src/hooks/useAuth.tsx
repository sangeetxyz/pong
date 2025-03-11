"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export enum EAuthState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  SIGNING = "signing",
  SIGNED = "signed",
  ERROR = "error",
}

const useAuth = () => {
  const [authState, setAuthState] = useState<EAuthState>(
    EAuthState.DISCONNECTED,
  );
  const { status: appkitStatus, address } = useAppKitAccount();
  const { status: nextAuthStatus, data, update } = useSession();

  useEffect(() => {
    if (nextAuthStatus === "authenticated" && !!data.user.id) {
      setAuthState(EAuthState.SIGNED);
    } else {
      switch (appkitStatus) {
        case "connecting":
        case "reconnecting":
          setAuthState(EAuthState.CONNECTING);
          break;
        case "connected":
          setAuthState(EAuthState.CONNECTED);
          break;
        case "disconnected":
          setAuthState(EAuthState.DISCONNECTED);
          break;
        default:
          setAuthState(EAuthState.ERROR);
          break;
      }
    }
  }, [appkitStatus, nextAuthStatus]);

  return { authState, setAuthState, user: data?.user };
};

export default useAuth;
