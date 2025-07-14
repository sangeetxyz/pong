"use client";

import Game from "./_components/home/Game";
import GameModal from "./_components/modals/GameModal";
import GameScore from "./_components/home/GameScore";
import Controls from "./_components/home/Controls";
import Huddle from "./_components/home/Huddle";
import Mobile from "./_components/home/Mobile";
import Refer from "./_components/home/Refer";

export default function Home() {
  return (
    <>
      <div className="relative hidden h-screen md:flex">
        <Game />
        <GameScore />
        <GameModal />
        <Controls />
        <Huddle />
        <Refer />
      </div>
      <Mobile />
    </>
  );
}
