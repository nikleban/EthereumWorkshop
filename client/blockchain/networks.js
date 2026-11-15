// In Node there is no window, so fall back to the local server's origin
const origin = globalThis.window?.location.origin ?? "http://localhost:3000"

const isDev = import.meta.env?.DEV ?? false
const ANVIL_RPC_URL =  isDev ? "http://localhost:8545" : null;

export const FUNDED_ETH_PRIVATE_KEYS = isDev ? ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"] : [];
export const DOCKER_CHAIN_ID = 31337;
export const SEPOLIA_CHAIN_ID = 11155111;

// mainnet and sepolia always go through the server proxy (/api/rpc → Alchemy),
// so Alchemy-only methods like alchemy_getAssetTransfers work in dev too.
// canFaucet: whether the dashboard shows the "send test ETH" button.
export const NETWORKS = {
  mainnet: {
    label: "eth-mainnet",
    chainId: 1,
    rpcUrl: origin + `/api/rpc/mainnet`,
    canFaucet: false,
  },
  sepolia: {
    label: "eth-sepolia",
    chainId: SEPOLIA_CHAIN_ID,
    rpcUrl: origin + `/api/rpc/sepolia`,
    canFaucet: true,
  },
  // Dev only, so it never ships in the production build
  ...(isDev && {
    local: {
      label: "anvil-local",
      chainId: DOCKER_CHAIN_ID,
      rpcUrl: ANVIL_RPC_URL,
      canFaucet: true,
    },
  }),
}
