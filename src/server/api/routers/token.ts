import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { env } from "@/env";
import { leaderboard, referrals } from "@/server/db/schema";
import { sql, eq, and } from "drizzle-orm";
import { getBalance, rewardUser } from "@/server/web3";
import { Address } from "viem";

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

      const userAddress = ctx.session.user.id;
      let finalScore = input.score;
      let bonusMessage = "";

      // Check if this is the user's first game
      const existingUser = await ctx.db.query.leaderboard.findFirst({
        where: eq(leaderboard.walletAddress, userAddress),
      });

      const isFirstGame = !existingUser?.hasPlayedFirstGame;

      // Check if user was referred
      const referralRecord = await ctx.db.query.referrals.findFirst({
        where: eq(referrals.refereeAddress, userAddress),
      });

      // Apply referee bonus (double points for first game)
      if (isFirstGame && referralRecord && !referralRecord.refereeRewardGiven) {
        finalScore = input.score * 2;
        bonusMessage = " (Double points for first game!)";

        // Mark referee reward as given
        await ctx.db
          .update(referrals)
          .set({
            refereeRewardGiven: true,
            isFirstGamePlayed: true,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(referrals.refereeAddress, userAddress));
      }

      // Reward the user with final score
      const rewardResult = await rewardUser(userAddress, finalScore);
      if (!rewardResult)
        return { success: false, message: "Reward failed. Please try again." };

      const currentScore = Math.floor(finalScore);
      const survivalTime = Math.floor((input.endTime - input.startTime) / 1000);
      const pongTokenCount = await getBalance(userAddress);

      // Update leaderboard
      await ctx.db
        .insert(leaderboard)
        .values({
          walletAddress: userAddress,
          highScore: currentScore,
          longestSurvival: survivalTime,
          pongTokenCount: pongTokenCount,
          hasPlayedFirstGame: true,
        })
        .onConflictDoUpdate({
          target: [leaderboard.walletAddress],
          set: {
            highScore: sql`GREATEST(${leaderboard.highScore}, ${currentScore})`,
            longestSurvival: sql`GREATEST(${leaderboard.longestSurvival}, ${survivalTime})`,
            pongTokenCount,
            hasPlayedFirstGame: true,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          },
        });

      // Handle referrer bonus if this was the referee's first game
      if (
        isFirstGame &&
        referralRecord &&
        !referralRecord.referrerRewardGiven
      ) {
        const referrerBonus = Math.floor(input.score * 3); // 3x of actual score
        const referrerRewardResult = await rewardUser(
          referralRecord.referrerAddress as Address,
          referrerBonus,
        );

        if (referrerRewardResult) {
          const referrerBalance = await getBalance(
            referralRecord.referrerAddress as Address,
          );
          await ctx.db
            .update(leaderboard)
            .set({
              pongTokenCount: referrerBalance,
              totalReferrals: sql`${leaderboard.totalReferrals} + 1`,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(
              eq(leaderboard.walletAddress, referralRecord.referrerAddress),
            );

          // Mark referrer reward as given
          await ctx.db
            .update(referrals)
            .set({
              referrerRewardGiven: true,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(referrals.refereeAddress, userAddress));
        }
      }

      return {
        success: true,
        message: `Reward credited successfully!${bonusMessage}`,
      };
    }),

  addReferral: protectedProcedure
    .input(
      z.object({
        referrerAddress: z.string().min(42).max(42),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const refereeAddress = ctx.session.user.id;

      const referrerExists = await ctx.db.query.leaderboard.findFirst({
        where: eq(leaderboard.walletAddress, input.referrerAddress),
      });

      if (!referrerExists) {
        return { success: false, message: "Invalid referrer address." };
      }

      if (input.referrerAddress === refereeAddress) {
        return {
          success: false,
          message: undefined,
        };
      }

      const existingReferral = await ctx.db.query.referrals.findFirst({
        where: eq(referrals.refereeAddress, refereeAddress),
      });

      if (existingReferral) {
        return { success: false, message: undefined };
      }

      const existingUser = await ctx.db.query.leaderboard.findFirst({
        where: eq(leaderboard.walletAddress, refereeAddress),
      });

      if (existingUser?.hasPlayedFirstGame) {
        return {
          success: false,
          message: undefined,
        };
      }

      try {
        await ctx.db.insert(referrals).values({
          referrerAddress: input.referrerAddress,
          refereeAddress: refereeAddress,
        });

        return {
          success: true,
          message:
            "Referral added successfully! You'll get double points for your first game.",
        };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("duplicate key value")
        ) {
          return {
            success: false,
            message: undefined,
          };
        }

        console.error("Unexpected referral insert error:", error);
        return {
          success: false,
          message: "Something went wrong while adding referral.",
        };
      }
    }),

  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const userAddress = ctx.session.user.id;

    const referralStats = await ctx.db.query.referrals.findMany({
      where: eq(referrals.referrerAddress, userAddress),
    });

    const leaderboardEntry = await ctx.db.query.leaderboard.findFirst({
      where: eq(leaderboard.walletAddress, userAddress),
    });

    const totalReferrals = referralStats.length;
    const successfulReferrals = referralStats.filter(
      (r) => r.isFirstGamePlayed,
    ).length;
    const pendingReferrals = referralStats.filter(
      (r) => !r.isFirstGamePlayed,
    ).length;

    return {
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      referralLink: `${env.NEXT_PUBLIC_BASE_URL}?ref=${userAddress}`,
      canShareReferral: leaderboardEntry?.hasPlayedFirstGame ?? false,
    };
  }),

  getUserDetails: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.leaderboard.findFirst({
      where: (leaderboard, { eq }) =>
        eq(leaderboard.walletAddress, ctx.session.user.id),
    });
    return data;
  }),

  getLeaderboardDetails: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.leaderboard.findMany({
      orderBy: (data, { desc }) => [desc(data.pongTokenCount)],
      limit: 10,
    });
    return data;
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

  const now = Date.now();
  const MAX_MS = Number(env.MAX_MS);
  if (now - data.endTime > MAX_MS) {
    console.error(
      `endTime ${data.endTime} is too old. The difference is ${
        now - data.endTime
      } ms, exceeding ${MAX_MS} ms.`,
    );
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
    const MAX_MULTIPLIER = Number(env.MAX_MULTIPLIER);
    expectedScore = 0;
    for (let i = 1; i <= data.count; i++) {
      const multiplier = Math.min(
        (1 + MULTIPLIER_GROWTH_RATE) ** i,
        MAX_MULTIPLIER,
      );
      expectedScore += multiplier;
    }
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
