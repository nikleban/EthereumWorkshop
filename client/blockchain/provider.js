import { ethers } from "ethers";
import { NETWORKS } from "./networks.js";

const providerCache = {}
const browserProviderCache = {}


// The frontend picks the network (NetworkContext calls setActiveNetwork);
// wallet actions just call getProvider() and get the provider for it.
let activeNetwork = "sepolia"

export function setActiveNetwork(network) {
  activeNetwork = network
}

export function getActiveNetwork() {
  return activeNetwork
}

export function getProvider(network = activeNetwork) {
  const { rpcUrl } = NETWORKS[network]
  return (providerCache[network] ??= new ethers.JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true }))
}

export function getBrowserProvider(walletObj, network = activeNetwork) {
  return(browserProviderCache[network] ??= new ethers.BrowserProvider(walletObj, undefined, { staticNetwork: true }))
}
