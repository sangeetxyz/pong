import { env } from "@/env";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateAddress = (address?: string) => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

/**
 * Returns a dynamic multiplier based on how many bounces (count) the player has achieved.
 *
 * @param {number} count - The number of successful bounces the player has made.
 * @returns {number} The calculated multiplier.
 */
export function getScoreMultiplier(count: number): number {
  const MULTIPLIER_GROWTH_RATE = Number(env.NEXT_PUBLIC_MULTIPLIER_GROWTH_RATE);

  if (count <= 0) return 1;

  return (1 + MULTIPLIER_GROWTH_RATE) ** count;
}

export function calculateScore(count: number, basePoints = 1) {
  const multiplier = getScoreMultiplier(count);
  return basePoints * multiplier;
}

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const formatTime = (ms: number) => {
  // Convert ms to total seconds
  const totalSeconds = Math.floor(ms / 1000);
  // Get minutes and seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  // Return in mm:ss format
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const formatSeconds = (totalSeconds: number): string => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  let formatted = "";
  if (hrs > 0) {
    formatted += `${hrs}h `;
  }
  if (mins > 0 || hrs > 0) {
    formatted += `${mins}m `;
  }
  formatted += `${secs}s`;
  return formatted.trim();
};

export function formatLargeNumber(input: number, noPadding?: boolean): string {
  const num = input;
  const absNum = Math.abs(num);

  if (absNum < 1_000) {
    const n = Math.floor(num).toString();
    return noPadding ? n : n.padStart(2, "0");
  }

  if (absNum < 1_000_000) {
    const truncated = Math.floor((num / 1_000) * 10) / 10;
    return `${truncated}K`;
  }

  if (absNum < 1_000_000_000) {
    const truncated = Math.floor((num / 1_000_000) * 10) / 10;
    return `${truncated}M`;
  }

  if (absNum < 1_000_000_000_000) {
    const truncated = Math.floor((num / 1_000_000_000) * 10) / 10;
    return `${truncated}B`;
  }

  const truncated = Math.floor((num / 1_000_000_000_000) * 10) / 10;
  return `${truncated}T`;
}
