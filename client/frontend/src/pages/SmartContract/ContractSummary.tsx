import { formatEther } from "ethers"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { ContractState } from "@/queries/contractQueries"
import { SOLIDITY_VERSION, shortAddress } from "@/pages/SmartContract/contractSource"

type ContractSummaryProps = {
    contractAddress: string
    state: ContractState | undefined
    isPending: boolean
    error: Error | null
}

const Dot = ({ className }: { className: string }) => <span className={`size-1.5 rounded-full ${className}`} />

export const ContractSummary = ({ contractAddress, state, isPending, error }: ContractSummaryProps) => {
    return (
        <section className="flex flex-col gap-3">
            {error ? (
                <p className="text-red-400">{error.message}</p>
            ) : isPending || !state ? (
                <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-8 w-[460px]" />
                    <Skeleton className="h-5 w-80" />
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap items-center gap-2">
                        {state.deployed ? (
                            <Badge variant="outline"><Dot className="bg-green-400" />Deployed</Badge>
                        ) : (
                            <Badge variant="outline"><Dot className="bg-red-400" />No contract at this address</Badge>
                        )}
                        {SOLIDITY_VERSION && <Badge variant="outline">Solidity {SOLIDITY_VERSION}</Badge>}
                    </div>
                    <div className="flex flex-wrap items-baseline gap-3.5">
                        <h1 className="text-[28px] font-medium tracking-tight">CommunityCounter</h1>
                        <span className="font-mono text-sm text-[#a1a1a1] break-all">{contractAddress}</span>
                    </div>
                    {state.deployed && (
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#a1a1a1]">
                            <span>Leader <span className="font-mono text-[#d4d4d4]">{shortAddress(state.leader)}</span></span>
                            <span>Members <span className="font-mono text-[#d4d4d4]">{state.counter.toString()}</span></span>
                            <span>Contract balance <span className="font-mono text-[#d4d4d4]">{formatEther(state.balance)} ETH</span></span>
                        </div>
                    )}
                </>
            )}
        </section>
    )
}
