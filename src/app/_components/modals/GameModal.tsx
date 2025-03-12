import React from "react";
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

const GameModal = () => {
  const { startGame, score, isOpen, explore, multiplier } = useGame();
  const { active } = useProgress();

  const hasScore = score > 0;

  return (
    <Dialog open={isOpen && !active}>
      <DialogContent
        disableX
        className="w-96 rounded-3xl bg-zinc-950/50 p-6 shadow-xl backdrop-blur-md"
      >
        <DialogHeader>
          {/* Conditionally change title & description based on hasScore */}
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
            <div className="relative bg-gradient-to-r from-lime-500 to-lime-300 bg-clip-text text-7xl font-extrabold text-transparent">
              {score.toFixed(0)}
              {multiplier > 1 && (
                <div className="absolute -right-10 bottom-1.5 text-base font-bold text-yellow-400">
                  x{multiplier.toFixed(1)}
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
              Go Back
            </Button>
            <Button
              onClick={startGame}
              // variant={"secondary"}
              className="w-full rounded-xl"
            >
              {hasScore ? "Restart Game" : "Start Game"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameModal;
