import { useGameAtom } from "@/atoms/game.atom";
import { getToken } from "@/lib/action";
import { calculateScore, getScoreMultiplier } from "@/lib/utils";
import { clamp } from "lodash-es";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useReferral } from "@/hooks/useReferral";
import { useSession } from "next-auth/react";

const createAudio = (src: string): HTMLAudioElement => {
  if (typeof window === "undefined") return {} as HTMLAudioElement;
  return new Audio(src);
};

const useGame = () => {
  const [gameState, setGameState] = useGameAtom();
  const { processPendingReferral } = useReferral();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      processPendingReferral();
    }
  }, [session?.user, processPendingReferral]);

  const pong = useCallback(
    (velocity: number) => {
      const ping = createAudio("/ping.mp3");
      ping.currentTime = 0;
      ping.volume = clamp(velocity / 20, 0, 1);
      ping.play().catch((e) => {
        console.error(e);
      });

      if (velocity > 10) {
        setGameState((prev) => {
          const newCount = prev.count + 1;
          return {
            ...prev,
            count: newCount,
            score: prev.score + calculateScore(newCount),
            multiplier: getScoreMultiplier(newCount),
          };
        });
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

  const endGame = useCallback(async () => {
    if (!gameState.startTime) return;
    setGameState((prev) => ({
      ...prev,
      playing: false,
      isOpen: true,
      endTime: Date.now(),
      isLoading: true,
    }));

    const res = await getToken({
      score: gameState.score,
      startTime: gameState.startTime,
      endTime: Date.now(),
      count: gameState.count,
    });

    handleRes(res);
    setGameState((prev) => ({ ...prev, isLoading: false }));
  }, [setGameState, gameState]);

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
    isLoading: gameState.isLoading,
  };
};

export default useGame;

const handleRes = ({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) => {
  if (!success) {
    toast.error(message);
    return;
  }
  toast.success(message);
};
