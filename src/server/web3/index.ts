"server only";

import { PongTokenABI } from "@/common/abis";
import { env } from "@/env";
import {
  createPublicClient,
  createWalletClient,
  http,
  getContract,
  type Address,
  parseEther,
  parseUnits,
  formatUnits,
  // waitForTransactionReceipt,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { waitForTransactionReceipt } from "viem/actions";
import { huddle01Testnet } from "viem/chains";

const rpcUrl = env.RPC_URL;
const serverPrivateKey = env.PRIVATE_KEY as Address;
const pongTokenAddress = env.NEXT_PUBLIC_PONGTOKEN_ADDRESS as Address;

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

const pongTokenContract = getContract({
  address: pongTokenAddress,
  abi: PongTokenABI,
  client: publicClient,
});

const pongTokenContractWithWallet = getContract({
  address: pongTokenAddress,
  abi: PongTokenABI,
  client: walletClient,
});

export const rewardUser = async (
  userAddress: Address,
  score: number,
): Promise<boolean> => {
  try {
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

export const getBalance = async (userAddress: Address): Promise<number> => {
  try {
    const balance = await pongTokenContract.read.balanceOf([userAddress]);
    const decimals = await pongTokenContract.read.decimals();
    console.log(
      `Balance of ${userAddress}: ${formatUnits(balance, decimals).toString()}`,
    );
    return Number(formatUnits(balance, decimals));
  } catch (error) {
    console.error("Error getting balance:", error);
    return 0;
  }
};
