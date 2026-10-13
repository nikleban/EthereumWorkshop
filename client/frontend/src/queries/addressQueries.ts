import { queryOptions } from "@tanstack/react-query"
import type { Network } from "@/context/NetworkContext"
import { getBalance, getTransactionCount, getTransactionHistory, isEthAddressContract } from "@blockchain/walletActions"

// Every query about an address starts with this key. Invalidating it
// (e.g. after a send) refetches all of them at once.
export const addressKey = (network: Network, ethAddress: string) => ["address", network, ethAddress] as const

// network is in the key so switching networks gets its own cache entry.
// The fetchers read the active network from provider.js, which NetworkContext
// updates before React re-renders, so it always matches the key.
export const addressOverviewQuery = (network: Network, ethAddress: string) =>
  queryOptions({
    queryKey: [...addressKey(network, ethAddress), "overview"],
    queryFn: async () => {
      const [balance, txCount, isContract] = await Promise.all([
        getBalance(ethAddress),
        getTransactionCount(ethAddress),
        isEthAddressContract(ethAddress),
      ])
      return { balance, txCount, isContract }
    },
  })

export const transactionHistoryQuery = (network: Network, ethAddress: string) =>
  queryOptions({
    queryKey: [...addressKey(network, ethAddress), "history"],
    queryFn: () => getTransactionHistory(ethAddress),
  })
