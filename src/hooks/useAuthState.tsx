"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export enum EAuthState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  SIGNING = "signing",
  SIGNED = "signed",
  ERROR = "error",
}

const useAuthState = () => {
  const [authState, setAuthState] = useState<EAuthState>(
    EAuthState.DISCONNECTED,
  );
  const { status } = useAccount();

  useEffect(() => {
    switch (status) {
      case "connecting":
        setAuthState(EAuthState.CONNECTING);
        break;
      case "connected":
        setAuthState(EAuthState.CONNECTED);
        break;
      case "disconnected":
        setAuthState(EAuthState.DISCONNECTED);
        break;
      case "reconnecting":
        setAuthState(EAuthState.CONNECTING);
    }
  }, [status]);

  return { authState, setAuthState };
};

export default useAuthState;
