import { useGameAtom } from "@/atoms/game.atom";
import { clamp } from "lodash-es";
import React, { useCallback } from "react";

const createAudio = (src: string): HTMLAudioElement => {
  if (typeof window === "undefined") return {} as HTMLAudioElement;
  return new Audio(src);
};

const useGame = () => {
  const [gameState, setGameState] = useGameAtom();

  const pong = useCallback(
    (velocity: number) => {
      const ping = createAudio("/ping.mp3");
      ping.currentTime = 0;
      ping.volume = clamp(velocity / 20, 0, 1);
      ping.play().catch(() => {}); // Handle autoplay restrictions

      // Update score if velocity is high enough
      if (velocity > 10) {
        setGameState((prev) => ({ ...prev, count: prev.count + 1 }));
      }
    },
    [setGameState],
  );

  const startGame = useCallback(() => {
    console.log("Game started!");
    setGameState({ count: 0, playing: true });
  }, [setGameState]);

  const endGame = useCallback(() => {
    console.log("Game ended!");
    setGameState({ count: 0, playing: false });
  }, [setGameState]);

  return {
    gameState,
    pong,
    startGame,
    endGame,
  };
};

export default useGame;
