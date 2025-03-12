import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
// import { wait } from "@/lib/utils";
import { env } from "@/env";
import {
  createPublicClient,
  createWalletClient,
  http,
  getContract,
  type Address,
  // waitForTransactionReceipt,
} from "viem";
import { PongTokenABI } from "@/common/abis";
import { waitForTransactionReceipt } from "viem/actions";
import { huddle01Testnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
// import { posts } from "@/server/db/schema";

export const tokenRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

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
      if (Math.floor(input.score) < 99)
        return { success: false, message: "Score atleast 100 to get reward." };
      const rewardResult = await rewardUser(ctx.session.user.id, input.score);
      if (!rewardResult)
        return { success: false, message: "Reward failed. Please try again." };

      return { success: true, message: "Reward credited successfully!" };
    }),

  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.db.insert(posts).values({
  //       name: input.name,
  //       createdById: ctx.session.user.id,
  //     });
  //   }),

  // getLatest: protectedProcedure.query(async ({ ctx }) => {
  //   const post = await ctx.db.query.posts.findFirst({
  //     orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  //   });

  //   return post ?? null;
  // }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
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

const rewardUser = async (
  userAddress: Address,
  score: number,
): Promise<boolean> => {
  try {
    const rpcUrl = env.RPC_URL;
    const serverPrivateKey = env.PRIVATE_KEY as Address;
    const pongTokenAddress = env.PONGTOKEN_ADDRESS as Address;

    const publicClient = createPublicClient({
      chain: huddle01Testnet,
      transport: http(rpcUrl),
    });

    const account = privateKeyToAccount(serverPrivateKey);

    const walletClient = createWalletClient({
      chain: huddle01Testnet,
      transport: http(rpcUrl),
      account,
    });

    // const pongTokenContract = getContract({
    //   address: pongTokenAddress,
    //   abi: PongTokenABI,
    //   client: publicClient,
    // });

    const pongTokenContractWithWallet = getContract({
      address: pongTokenAddress,
      abi: PongTokenABI,
      client: walletClient,
    });

    const rewardScore = BigInt(Math.floor(score));

    console.log(
      `Rewarding ${userAddress} with score ${rewardScore.toString()}`,
    );

    const txHash = await pongTokenContractWithWallet.write.reward([
      userAddress,
      rewardScore,
    ]);

    await waitForTransactionReceipt(publicClient, { hash: txHash });

    console.log(`Reward transaction successful. Transaction hash: ${txHash}`);
    return true;
  } catch (error) {
    console.error("Reward operation failed:", error);
    return false;
  }
};
