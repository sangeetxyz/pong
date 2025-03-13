import React, { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import useGame from "@/hooks/useGame";
import { Button } from "../ui/button";
import { RiPingPongLine } from "react-icons/ri";
import { useProgress } from "@react-three/drei";
import useAuth from "@/hooks/useAuth";
import { formatLargeNumber } from "@/lib/utils";
import Wallet from "../buttons/Wallet";

const GameModal = memo(() => {
  const { startGame, score, isOpen, explore, multiplier, isLoading } =
    useGame();
  const { user } = useAuth();
  const { active } = useProgress();

  const hasScore = score > 0;

  return (
    <Dialog open={isOpen && !active}>
      <DialogContent
        disableX
        className="hidden w-96 rounded-3xl bg-zinc-950/50 p-6 shadow-xl backdrop-blur-md md:block"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white">
            {hasScore ? "Ready for another round?" : "Are you ready?"}
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            {hasScore
              ? "Your last game’s score is shown below. Try to beat it this time!"
              : "Score as many points as you can by hitting the ball with the paddle."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6">
          {!hasScore && (
            <RiPingPongLine className="mt-8 h-24 w-24 animate-bounce text-lime-400" />
          )}

          {hasScore && (
            <div className="mt-4 flex flex-col place-items-baseline space-y-1">
              <div className="bg-gradient-to-r from-lime-500 to-lime-300 bg-clip-text text-7xl font-extrabold text-transparent">
                {formatLargeNumber(Math.floor(score))}
              </div>
              {Math.floor(multiplier) > 1 && (
                <div className="w-full text-center text-xs text-yellow-400">
                  With x{formatLargeNumber(Math.floor(multiplier), true)}{" "}
                  multiplier
                </div>
              )}
            </div>
          )}
          <div className="flex w-full space-x-6">
            <Button
              onClick={explore}
              variant={"secondary"}
              className="w-full rounded-xl"
            >
              Explore
            </Button>
            {user ? (
              <Button
                disabled={isLoading}
                onClick={startGame}
                className="w-full rounded-xl"
              >
                {isLoading
                  ? "Validating Score..."
                  : hasScore
                    ? "Restart Game"
                    : "Start Game"}
              </Button>
            ) : (
              <Wallet className="w-full" />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

GameModal.displayName = "GameModal";

export default GameModal;
