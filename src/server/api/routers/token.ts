import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { leaderboard } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import { getBalance, rewardUser } from "@/server/web3";

export const tokenRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        score: z.number(),
        startTime: z.number(),
        endTime: z.number(),
        count: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const isValid = isValidGameData(input);
      if (!isValid) return { success: false, message: "Invalid game data." };
      if (Math.floor(input.score) < Number(env.NEXT_PUBLIC_MINIMUM_SCORE) - 1)
        return {
          success: false,
          message: `Score atleast ${env.NEXT_PUBLIC_MINIMUM_SCORE} to get reward.`,
        };
      const rewardResult = await rewardUser(ctx.session.user.id, input.score);
      if (!rewardResult)
        return { success: false, message: "Reward failed. Please try again." };
      const currentScore = Math.floor(input.score);
      const survivalTime = Math.floor((input.endTime - input.startTime) / 1000);
      const pongTokenCount = await getBalance(ctx.session.user.id);
      const a = await ctx.db
        .insert(leaderboard)
        .values({
          walletAddress: ctx.session.user.id,
          highScore: currentScore.toString(),
          longestSurvival: survivalTime.toString(),
          pongTokenCount: pongTokenCount.toString(),
        })
        .onConflictDoUpdate({
          target: [leaderboard.walletAddress],
          set: {
            highScore: sql`GREATEST(${leaderboard.highScore}, ${currentScore})`,
            longestSurvival: sql`GREATEST(${leaderboard.longestSurvival}, ${survivalTime})`,
            pongTokenCount: sql`GREATEST(${leaderboard.pongTokenCount}, ${pongTokenCount})`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          },
        });

      return { success: true, message: "Reward credited successfully!" };
    }),
});

type TIsValidGameData = {
  score: number;
  startTime: number;
  endTime: number;
  count: number;
};

const isValidGameData = (data: TIsValidGameData): boolean => {
  if (data.startTime >= data.endTime) {
    console.error("Invalid timestamps: startTime must be less than endTime");
    return false;
  }
  const MULTIPLIER_GROWTH_RATE = Number(env.MULTIPLIER_GROWTH_RATE);
  const MAX_BOUNCES_PER_SECOND = Number(env.MAX_BOUNCES_PER_SECOND);

  let expectedScore: number;

  if (data.count <= 0) {
    expectedScore = 0;
  } else if (MULTIPLIER_GROWTH_RATE === 0) {
    expectedScore = data.count;
  } else {
    // Use the formula for the sum of a geometric series:
    // S = a*(r^n - 1)/(r - 1)
    // Here a = (1+MGR) and r = (1+MGR).
    // This yields: expectedScore = ( (1+MGR)^(count+1) - (1+MGR) ) / MGR.
    expectedScore =
      ((1 + MULTIPLIER_GROWTH_RATE) ** (data.count + 1) -
        (1 + MULTIPLIER_GROWTH_RATE)) /
      MULTIPLIER_GROWTH_RATE;
  }

  const tolerance = 0.001;

  const isScoreValid = Math.abs(data.score - expectedScore) < tolerance;

  if (!isScoreValid) {
    console.error(
      `Score validation failed. Expected score approximately ${expectedScore}, but got ${data.score}`,
    );
    return false;
  }

  const elapsedSeconds = (data.endTime - data.startTime) / 1000;

  const maxAllowedCount = elapsedSeconds * MAX_BOUNCES_PER_SECOND;

  if (data.count > maxAllowedCount) {
    console.error(
      `Bounce count validation failed. Count ${data.count} exceeds maximum allowed ${maxAllowedCount} for elapsed time ${elapsedSeconds}s.`,
    );
    return false;
  }

  // All validations passed.
  return true;
};
