import useGame from "@/hooks/useGame";
import { Button } from "../ui/button";
import { RiPingPongFill } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";
import Wallet from "../buttons/Wallet";
import { memo } from "react";
import useAuth from "@/hooks/useAuth";
import MusicButton from "../buttons/MusicButton";
import LeaderboardModal from "../modals/LBModal";

const Controls = memo(() => {
  const { startGame, isPlaying } = useGame();
  const { user } = useAuth();
  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center space-x-2 rounded-2xl border border-zinc-700 bg-zinc-950/30 p-2 backdrop-blur-md">
      <div className="px-2 font-bold italic">
        Pong<span className="text-lime-400">01</span>
      </div>
      <Button
        disabled={isPlaying || !user}
        onClick={startGame}
        variant={"secondary"}
        className="bg-lime-400 hover:bg-lime-500"
      >
        <RiPingPongFill className="text-lime-950" />
        <div className="font-bold text-lime-950">Play</div>
      </Button>
      <MusicButton />
      <LeaderboardModal />
      <Button
        variant={"secondary"}
        className="flex aspect-square justify-center p-0"
      >
        <IoSettingsSharp className="" />
      </Button>
      <Wallet />
    </div>
  );
});

export default Controls;

Controls.displayName = "Controls";
