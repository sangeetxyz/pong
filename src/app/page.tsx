"use client";

import Wallet from "./_components/buttons/Wallet";
import Game from "./_components/home/Game";

export default function Home() {
  
  return (
    <div className="relative flex h-screen">
      <Game />
      <div className="absolute right-4 top-4">
        <Wallet />
      </div>
    </div>
  );
}
