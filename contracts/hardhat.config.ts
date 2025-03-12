import { type HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const privateKey = vars.get("PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    huddle: {
      url: "https://huddle-testnet.rpc.caldera.xyz/http",
      accounts: [privateKey],
    },
  },
  ignition: {
    requiredConfirmations: 1,
  },
};

export default config;
