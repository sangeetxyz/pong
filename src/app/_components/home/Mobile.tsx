import Image from "next/image";
import React from "react";

const Mobile = () => {
  return (
    <div className="absolute left-0 top-0 z-10 flex h-screen w-full md:hidden">
      <Image
        src={"/gifs/roll.gif"}
        height={1000}
        width={1000}
        alt=""
        className="object-cover"
      />
    </div>
  );
};

export default Mobile;
