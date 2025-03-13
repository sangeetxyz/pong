"use client";

import Game from "./_components/home/Game";
import GameModal from "./_components/modals/GameModal";
import GameScore from "./_components/home/GameScore";
import Controls from "./_components/home/Controls";

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
