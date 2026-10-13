import { createContext, useContext, useState, type ReactNode } from "react"
import { setActiveNetwork } from "@blockchain/provider"

// "local" (Anvil) only exists in dev, see NETWORKS in networks.js
export type Network = "mainnet" | "sepolia" | "local"

type NetworkCtx = {
  network: Network
  setNetwork: (network: Network) => void
}

const NetworkContext = createContext<NetworkCtx | null>(null)

export function NetworkProvider({ children }: { children: ReactNode }) {
  // Default to the testnet so nothing touches mainnet by accident
  const [network, setNetworkState] = useState<Network>(() => {
    setActiveNetwork("sepolia")
    return "sepolia"
  })

  // Update provider.js before React re-renders, so children's effects
  // that refetch on `network` already see the new provider
  const setNetwork = (next: Network) => {
    setActiveNetwork(next)
    setNetworkState(next)
  }

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error("useNetwork must be used inside NetworkProvider")
  return ctx
}
