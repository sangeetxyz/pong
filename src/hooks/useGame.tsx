import { useGameAtom } from "@/atoms/game.atom";
import { clamp } from "lodash-es";
import React, { useCallback } from "react";

const createAudio = (src: string): HTMLAudioElement => {
  if (typeof window === "undefined") return {} as HTMLAudioElement;
  return new Audio(src);
};

const MULTIPLIER_GROWTH_RATE = 0.05;

/**
 * Returns a dynamic multiplier based on how many bounces (count) the player has achieved.
 *
 * @param {number} count - The number of successful bounces the player has made.
 * @returns {number} The calculated multiplier.
 */
function getScoreMultiplier(count: number): number {
  // If count is 0 (or less), don't apply any multiplier.
  if (count <= 0) return 1;

  // Example: Exponential growth
  // multiplier = (1 + growthRate) ^ count
  // e.g., with a rate of 0.05 and 10 bounces,
  // multiplier = (1.05)^10 ≈ 1.63
  // If you want a different shape (e.g., linear), see alternative examples below.
  return (1 + MULTIPLIER_GROWTH_RATE) ** count;
}

function calculateScore(count: number, basePoints = 1) {
  const multiplier = getScoreMultiplier(count);
  return basePoints * multiplier;
}

const useGame = () => {
  const [gameState, setGameState] = useGameAtom();

  const pong = useCallback(
    (velocity: number) => {
      const ping = createAudio("/ping.mp3");
      ping.currentTime = 0;
      ping.volume = clamp(velocity / 20, 0, 1);
      //   ping.play().catch(() => {});

      // Update score if velocity is high enough
      if (velocity > 10) {
        setGameState((prev) => ({
          ...prev,
          count: prev.count + 1,
          score: prev.score + calculateScore(prev.count),
          multiplier: getScoreMultiplier(prev.count),
        }));
      }
    },
    [setGameState],
  );

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      count: 0,
      score: 0,
      playing: true,
      isOpen: false,
      startTime: Date.now(),
      endTime: null,
    }));
  }, [setGameState]);

  const endGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      playing: false,
      isOpen: true,
      endTime: Date.now(),
    }));
  }, [setGameState]);

  const explore = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      playing: false,
      isOpen: false,
      count: 0,
      score: 0,
      multiplier: 1,
      startTime: null,
      endTime: null,
    }));
  }, [setGameState]);

  const setIsOpen = useCallback(
    (isOpen: boolean) => {
      setGameState((prev) => ({ ...prev, isOpen }));
    },
    [setGameState],
  );

  return {
    count: gameState.count,
    isPlaying: gameState.playing,
    pong,
    startGame,
    endGame,
    isOpen: gameState.isOpen,
    setIsOpen,
    explore,
    timer: {
      startTime: gameState.startTime,
      endTime: gameState.endTime,
    },
    score: gameState.score,
    multiplier: gameState.multiplier,
  };
};

export default useGame;
