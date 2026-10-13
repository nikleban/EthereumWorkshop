import path from "node:path";

// Fail at startup instead of on the first request
const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name} (see server/.env.example)`);
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 3000),
  staticDir: path.resolve(import.meta.dirname, process.env.STATIC_DIR ?? "../client/frontend/dist"),

  rpcUrls: {
    mainnet: required("ALCHEMY_MAINNET_URL"),
    sepolia: required("ALCHEMY_SEPOLIA_URL"),
  },

  faucet: {
    privateKey: required("FAUCET_PRIVATE_KEY"),
    amountWei: BigInt(required("FAUCET_AMOUNT_WEI")),
    chainId: 11155111,
  },
};
