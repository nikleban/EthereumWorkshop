import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { JsonRpcProvider } from "ethers"
import { getProvider } from "@blockchain/provider"

export type Network = "mainnet" | "sepolia"

type NetworkCtx = {
  network: Network
  setNetwork: (network: Network) => void
  provider: JsonRpcProvider
}

const NetworkContext = createContext<NetworkCtx | null>(null)

export function NetworkProvider({ children }: { children: ReactNode }) {
  // Default to the testnet so nothing touches mainnet by accident
  const [network, setNetwork] = useState<Network>("sepolia")
  const provider = useMemo(() => getProvider(network), [network])

  return (
    <NetworkContext.Provider value={{ network, setNetwork, provider }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error("useNetwork must be used inside NetworkProvider")
  return ctx
}
