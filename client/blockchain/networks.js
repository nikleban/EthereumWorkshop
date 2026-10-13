// In Node there is no window, so fall back to the local server's origin
const origin = globalThis.window?.location.origin ?? "http://localhost:3000"

// Vite sets this; in plain Node import.meta.env is undefined, so treat it as prod
const isDev = import.meta.env?.DEV ?? false

// Anvil from docker-compose. The server proxy is read-only (no eth_sendRawTransaction),
// so the browser talks to Anvil directly to be able to sign and send.
const ANVIL_RPC_URL = "http://localhost:8545"

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
