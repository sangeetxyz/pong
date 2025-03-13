import { nanoid } from "nanoid";
import { memo, useEffect, useRef } from "react";
import { PiMusicNoteBold, PiMusicNoteFill } from "react-icons/pi";
import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";

const MusicButton = memo(() => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioSrc = "/glossy.mp3";
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const fadeInterval = useRef<NodeJS.Timeout | null>(null);
  const MAX_VOLUME = 0.05;

  useEffect(() => {
    const audioElement = new Audio(audioSrc);
    audioElement.volume = 0;
    audioElement.loop = true;
    setAudio(audioElement);

    return () => {
      audioElement.pause();
      if (fadeInterval.current) clearInterval(fadeInterval.current);
    };
  }, []);

  const smoothVolume = (start: number, end: number, duration: number) => {
    if (!audio) return;

    if (fadeInterval.current) clearInterval(fadeInterval.current);

    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = (end - start) / steps;

    let currentStep = 0;
    let currentVolume = start;

    fadeInterval.current = setInterval(() => {
      currentStep++;
      currentVolume += volumeStep;

      if (
        (volumeStep > 0 && currentVolume >= end) ||
        (volumeStep < 0 && currentVolume <= end)
      ) {
        currentVolume = end;
        clearInterval(fadeInterval.current as NodeJS.Timeout);
        fadeInterval.current = null;

        if (end === 0) {
          audio.pause();
        }
      }

      audio.volume = currentVolume;
    }, stepTime);
  };

  const toggleMusic = () => {
    if (!audio) return;

    if (isPlaying) {
      smoothVolume(audio.volume, 0, 500);
      setIsPlaying(false);
    } else {
      audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
        return;
      });
      smoothVolume(0, MAX_VOLUME, 800);
      setIsPlaying(true);
    }
  };

  const waveVariants = {
    playing: {
      transition: {
        staggerChildren: 0.1,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
      },
    },
    paused: {
      transition: {
        staggerChildren: 0,
      },
    },
  };

  const dotVariants = {
    playing: (i: number) => ({
      y: [-4, 4],
      transition: {
        duration: 0.6,
        delay: i * 0.2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
      backGroundColor: "#A3E365",
    }),
    paused: {
      y: 0,
      transition: {
        duration: 0.4,
      },
      backgroundColor: "#fff",
    },
  };

  const dots = Array.from({ length: 5 });

  return (
    <Button
      variant="secondary"
      className="relative flex items-center gap-2 overflow-hidden px-4 py-2"
      onClick={toggleMusic}
    >
      {/* <div className="mr-1 text-lime-400">Music</div> */}
      {isPlaying ? (
        <PiMusicNoteFill className="text-lime-400" />
      ) : (
        <PiMusicNoteBold className="" />
      )}

      <div className="relative flex h-6 w-8 items-center">
        <motion.div
          className="absolute flex w-full items-center justify-between"
          variants={waveVariants}
          animate={isPlaying ? "playing" : "paused"}
        >
          {dots.map((_, i) => (
            <motion.div
              key={nanoid()}
              custom={i}
              variants={dotVariants}
              className="size-1 rounded-full bg-lime-400"
            />
          ))}
        </motion.div>
      </div>
    </Button>
  );
});

MusicButton.displayName = "MusicButton";

export default MusicButton;
