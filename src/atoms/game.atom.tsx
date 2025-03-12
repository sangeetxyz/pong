import { useAtom } from "jotai/react";
import { atomWithReset } from "jotai/utils";

type TGameState = {
  count: number;
  playing: boolean;
  isOpen: boolean;
  isLoading: boolean;
  startTime: number | null;
  endTime: number | null;
  score: number;
  multiplier: number;
};

const initialGameState: TGameState = {
  count: 0,
  playing: false,
  isLoading: false,
  isOpen: true,
  startTime: null,
  endTime: null,
  score: 0,
  multiplier: 1,
};

export const gameAtom = atomWithReset<TGameState>(initialGameState);

export const useGameAtom = () => useAtom(gameAtom);
