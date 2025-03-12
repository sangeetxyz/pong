"use client";

import useGame from "@/hooks/useGame";
import Wallet from "./_components/buttons/Wallet";
import Game from "./_components/home/Game";
import GameModal from "./_components/modals/GameModal";
import { RiPingPongLine } from "react-icons/ri";
import { Button } from "./_components/ui/button";
import { IoSettingsSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import CountUp from "./_components/ui/count-up";

export default function Home() {
  return (
    <div className="relative flex h-screen">
      <Game />
      <GameScore />
      <GameModal />
      <Controls />
    </div>
  );
}

const GameScore = () => {
  const { score, multiplier } = useGame();
  return (
    <div className="absolute left-8 top-8 flex flex-col">
      <div className="uppercase">score</div>
      <div className="relative -left-1 flex place-items-baseline space-x-1">
        <div className="bg-gradient-to-r from-lime-500 to-lime-300 bg-clip-text text-7xl font-extrabold text-transparent">
          {/* {score.toFixed(0).padStart(2, "0")} */}
          <CountUp to={Math.floor(score)} separator="," />
        </div>
        {Math.floor(multiplier) > 1 && (
          <div className="font-bold text-yellow-400">
            x{Math.floor(multiplier)}
          </div>
        )}
      </div>
      <GameTimer />
    </div>
  );
};

const Controls = () => {
  const { startGame, isPlaying } = useGame();
  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2 rounded-full border border-zinc-700 bg-zinc-950/50 p-2">
      <Button
        disabled={isPlaying}
        onClick={startGame}
        variant={"secondary"}
        className="aspect-square p-0"
      >
        <RiPingPongLine className="text-lime-400" />
      </Button>
      <Button
        disabled={isPlaying}
        variant={"secondary"}
        className="aspect-square p-0"
      >
        <IoSettingsSharp className="" />
      </Button>
      <Wallet />
    </div>
  );
};

const formatTime = (ms: number) => {
  // Convert ms to total seconds
  const totalSeconds = Math.floor(ms / 1000);
  // Get minutes and seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  // Return in mm:ss format
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const GameTimer = () => {
  const {
    timer: { startTime, endTime },
  } = useGame();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    if (startTime && endTime) {
      setElapsed(endTime - startTime);
      return;
    }

    const timerId = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [startTime, endTime]);

  if (!startTime && !endTime) {
    return <div>00:00</div>;
  }

  return <div>{formatTime(elapsed)}</div>;
};
