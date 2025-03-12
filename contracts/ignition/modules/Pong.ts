import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DEFAULT_TOKEN_NAME = "PongToken";
const DEFAULT_TOKEN_SYMBOL = "PONG";

const PongTokenModule = buildModule("PongTokenModule", (m) => {
  const tokenName = m.getParameter("name", DEFAULT_TOKEN_NAME);
  const tokenSymbol = m.getParameter("symbol", DEFAULT_TOKEN_SYMBOL);

  const pongToken = m.contract("PongToken", [tokenName, tokenSymbol], {});

  return { pongToken };
});

export default PongTokenModule;
