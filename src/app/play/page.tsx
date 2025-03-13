"use client";

import Game from "../_components/play/Game";
import GameModal from "../_components/modals/GameModal";
import GameScore from "../_components/play/GameScore";
import Controls from "../_components/play/Controls";

export default function Play() {
  return (
    <div className="relative flex h-screen">
      <Game />
      <GameScore />
      <GameModal />
      <Controls />
    </div>
  );
}
