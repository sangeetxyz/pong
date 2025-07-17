import Image from "next/image";
import Link from "next/link";
import React from "react";

const Huddle = () => {
  return (
    <Link href="https://testnet.huddle01.com" passHref>
      <div className="absolute right-4 top-4 flex cursor-pointer items-center space-x-1 rounded-xl bg-zinc-950/30 px-3 py-2 backdrop-blur-lg">
        <div className="text-xs">Powered by </div>
        <Image
          src="/hud-wht.png"
          width={55}
          height={15}
          alt="Huddle01 Logo"
          className=""
        />
        <div className="text-xs">testnet</div>
      </div>
    </Link>
  );
};

export default Huddle;
