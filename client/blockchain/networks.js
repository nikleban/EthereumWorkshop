const alchemyKey = import.meta.env.VITE_ALCHEMY_KEY

export const NETWORKS = {
  mainnet: {
    label: "eth-mainnet",
    chainId: 1,
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
  },
  sepolia: {
    label: "eth-sepolia",
    chainId: Number(import.meta.env.VITE_SEPOLIA_RPC_CHAIN_ID) ?? 11155111,
    // Local: Anvil in Docker. Prod: Alchemy Sepolia.
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL
      ?? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`,
  },
}
