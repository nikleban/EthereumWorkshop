import { queryOptions } from "@tanstack/react-query"
import type { Network } from "@/context/NetworkContext"
import { getCommunityCounterState, isUserInCommunity } from "@blockchain/communityCounter"

// Every query about a contract starts with this key, so one
// invalidate after a transaction refetches all of them.
export const contractKey = (network: Network, contractAddress: string) => ["contract", network, contractAddress] as const

export type ContractState =
  | { deployed: false }
  | { deployed: true; leader: string; counter: bigint; wallet: bigint; balance: bigint }

export const contractStateQuery = (network: Network, contractAddress: string) =>
  queryOptions({
    queryKey: [...contractKey(network, contractAddress), "state"],
    // The JS helper is untyped, so tell TypeScript what it returns
    queryFn: () => getCommunityCounterState(contractAddress) as Promise<ContractState>,
  })

export const membershipQuery = (network: Network, contractAddress: string, user: string) =>
  queryOptions({
    queryKey: [...contractKey(network, contractAddress), "member", user],
    queryFn: (): Promise<boolean> => isUserInCommunity(contractAddress, user),
  })
