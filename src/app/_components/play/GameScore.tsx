import useGame from "@/hooks/useGame";
import CountUp from "../ui/count-up";
import { memo, useEffect, useState } from "react";
import { formatLargeNumber, formatTime } from "@/lib/utils";

const GameScore = memo(() => {
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
            x{formatLargeNumber(Math.floor(multiplier), true)}
          </div>
        )}
      </div>
      <GameTimer />
    </div>
  );
});

GameScore.displayName = "GameScore";

export default GameScore;

const GameTimer = memo(() => {
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
    return (
      <div className="flex items-center space-x-1">
        {/* <LucideClock4 size={16} /> */}
        <div className="text-base font-normal">00:00</div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {/* <LucideClock4 size={16}  /> */}
      <div>{formatTime(elapsed)}</div>
    </div>
  );
});

GameTimer.displayName = "GameTimer";
