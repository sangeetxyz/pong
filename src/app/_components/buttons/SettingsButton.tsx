import React, { memo } from "react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { nanoid } from "nanoid";
import { EBgSrc, useBgAtom } from "@/atoms/bg.atom";
import Image from "next/image";
import { FaCheck, FaMap } from "react-icons/fa6";

const SettingsButton = memo(() => {
  const [bg, setBg] = useBgAtom();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"secondary"}
          className="flex aspect-square justify-center p-0"
        >
          <FaMap className="" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit rounded-2xl bg-zinc-900/80 p-2 shadow-lg backdrop-blur-lg">
        <div className="grid grid-cols-3 gap-2">
          {Object.values(EBgSrc).map((src, index) => (
            <button
              type="button"
              className="relative cursor-pointer"
              key={nanoid()}
              onClick={() => setBg({ src })}
            >
              <Image
                src={src}
                height={80}
                width={80}
                alt={`Background ${index + 1}`}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                {bg.src === src && (
                  <div className="rounded-full bg-zinc-900/80 p-1">
                    <FaCheck />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});

SettingsButton.displayName = "SettingsButton";

export default SettingsButton;
