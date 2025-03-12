import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import hre from "hardhat";
import { expect } from "chai";
import { getAddress } from "viem";

describe("PongToken", () => {
  // Fixture to deploy PongToken and get test accounts
  async function deployPongTokenFixture() {
    const tokenName = "PongToken";
    const tokenSymbol = "PONG";

    // Get the wallet clients (first signer is the deployer)
    const [deployer, otherAccount] = await hre.viem.getWalletClients();

    // Deploy the PongToken contract with the provided constructor parameters
    const pongToken = await hre.viem.deployContract("PongToken", [
      tokenName,
      tokenSymbol,
    ]);

    // Get the public client instance
    const publicClient = await hre.viem.getPublicClient();

    return {
      pongToken,
      tokenName,
      tokenSymbol,
      deployer,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", () => {
    it("Should set the correct name, symbol, and decimals", async () => {
      const { pongToken, tokenName, tokenSymbol } = await loadFixture(
        deployPongTokenFixture,
      );

      expect(await pongToken.read.name()).to.equal(tokenName);
      expect(await pongToken.read.symbol()).to.equal(tokenSymbol);
      expect(await pongToken.read.decimals()).to.equal(18);
    });

    it("Should have a zero total supply initially", async () => {
      const { pongToken } = await loadFixture(deployPongTokenFixture);
      expect(await pongToken.read.totalSupply()).to.equal(0n);
    });
  });

  describe("Minting and Reward", () => {
    it("Should allow an authorized minter to mint tokens", async () => {
      const { pongToken, deployer } = await loadFixture(deployPongTokenFixture);
      const mintAmount = 1000n;

      // Deployer is granted MINTER_ROLE by default.
      await pongToken.write.mint([deployer.account.address, mintAmount]);

      expect(await pongToken.read.totalSupply()).to.equal(mintAmount);
      expect(
        await pongToken.read.balanceOf([deployer.account.address]),
      ).to.equal(mintAmount);
    });

    it("Should allow authorized reward function to mint tokens based on score", async () => {
      const { pongToken, deployer } = await loadFixture(deployPongTokenFixture);
      const score = 500n;
      // SCORE_CONVERSION is 1, so expected reward equals the score.
      const expectedReward = score;

      await pongToken.write.reward([deployer.account.address, score]);

      expect(
        await pongToken.read.balanceOf([deployer.account.address]),
      ).to.equal(expectedReward);
      expect(await pongToken.read.totalSupply()).to.equal(expectedReward);
    });

    it("Should not allow a non-minter to mint tokens", async () => {
      const { pongToken, otherAccount } = await loadFixture(
        deployPongTokenFixture,
      );
      const mintAmount = 1000n;
      // Get contract instance with otherAccount as the signer
      const pongTokenAsOther = await hre.viem.getContractAt(
        "PongToken",
        pongToken.address,
        {
          client: { wallet: otherAccount },
        },
      );

      await expect(
        pongTokenAsOther.write.mint([otherAccount.account.address, mintAmount]),
      ).to.be.rejected;
    });
  });

  describe("Pausable Functionality", () => {
    it("Should allow transfers when not paused and reject them when paused", async () => {
      const { pongToken, deployer, otherAccount } = await loadFixture(
        deployPongTokenFixture,
      );
      const mintAmount = 1000n;
      const transferAmount = 100n;

      // Mint tokens to the deployer
      await pongToken.write.mint([deployer.account.address, mintAmount]);
      // Transfer some tokens to otherAccount; should succeed when not paused.
      await pongToken.write.transfer([
        otherAccount.account.address,
        transferAmount,
      ]);
      expect(
        await pongToken.read.balanceOf([otherAccount.account.address]),
      ).to.equal(transferAmount);

      // Pause the contract (only admin/deployer can pause)
      await pongToken.write.pause();

      // Attempting a transfer while paused should be rejected.
      await expect(
        pongToken.write.transfer([otherAccount.account.address, 50n]),
      ).to.be.rejected;

      // Unpause the contract and try to transfer again.
      await pongToken.write.unpause();
      await pongToken.write.transfer([otherAccount.account.address, 50n]);
      expect(
        await pongToken.read.balanceOf([otherAccount.account.address]),
      ).to.equal(150n);
    });
  });
});
