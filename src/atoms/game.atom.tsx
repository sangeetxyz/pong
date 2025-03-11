import { useAtom, useAtomValue, useSetAtom } from "jotai/react";
import { atomWithReset, useResetAtom } from "jotai/utils";

const initialGameState = {
  count: 0,
  playing: false,
};

export const gameAtom = atomWithReset(initialGameState);

export const useGameAtom = () => useAtom(gameAtom);

export const setGameAtom = () => useSetAtom(gameAtom);

export const getGameAtom = () => useAtomValue(gameAtom);

export const resetGameAtom = () => useResetAtom(gameAtom);
