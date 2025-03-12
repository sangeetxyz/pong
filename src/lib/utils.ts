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
