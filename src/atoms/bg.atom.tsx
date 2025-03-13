import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai/react";

export enum EBgSrc {
  BG1 = "/images/backgrounds/bg1.jpg",
  BG2 = "/images/backgrounds/bg2.jpg",
  BG3 = "/images/backgrounds/bg3.jpg",
  // BG4 = "/images/backgrounds/bg4.jpg",
  // BG5 = "/images/backgrounds/bg5.jpg",
}

export const bgAtom = atomWithStorage("bg", {
  src: EBgSrc.BG1,
});

export const useBgAtom = () => useAtom(bgAtom);
