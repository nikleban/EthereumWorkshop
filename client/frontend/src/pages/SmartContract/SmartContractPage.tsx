import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNetwork } from "@/context/NetworkContext"
import { addressKey } from "@/queries/addressQueries"
import { contractKey, contractStateQuery } from "@/queries/contractQueries"
import { ContractSummary } from "@/pages/SmartContract/ContractSummary"
import { ContractCode } from "@/pages/SmartContract/ContractCode"
import { WalletCard } from "@/pages/SmartContract/WalletCard"
import { ReadPanel } from "@/pages/SmartContract/ReadPanel"
import { WritePanel, type TxResult, type WriteFn } from "@/pages/SmartContract/WritePanel"
import { InteractionsTable, type Interaction } from "@/pages/SmartContract/InteractionsTable"
import { CONTRACT_RANGES } from "@/pages/SmartContract/contractSource"
import {
    COMMUNITY_COUNTER_ADDRESSES,
    getRevertReason,
} from "@blockchain/communityCounter"
import { connectWallet } from "@blockchain/walletActions";

type SmartContractPageProps = {
    // The address from the dashboard URL. The page only shows data for this
    // address and only sends transactions as it.
    ethAddress: string
}

export const SmartContractPage = ({ ethAddress }: SmartContractPageProps) => {
    const { network } = useNetwork()
    const queryClient = useQueryClient()

    // The app's own CommunityCounter on this network, null if it isn't deployed there
    const contractAddress: string | null = COMMUNITY_COUNTER_ADDRESSES[network]
    const [focus, setFocus] = useState<string | null>(null)
    const [interactions, setInteractions] = useState<Interaction[]>([])

    const state = useQuery({ ...contractStateQuery(network, contractAddress ?? ""), enabled: !!contractAddress })
    const contract = state.data?.deployed ? state.data : null

    if (!contractAddress) {
        return (
            <main className="px-20 py-6 text-left text-[#a1a1a1]">
                CommunityCounter isn't deployed on this network yet.
            </main>
        )
    }

    const send = async (fn: WriteFn, detail: string, valueWei?: bigint): Promise<TxResult> => {
        let interaction: Interaction
        try {
            const contract = await connectWallet();
            // Only donateToCommunity is payable, so only it gets a value
            const tx = valueWei === undefined ? await contract[fn]() : await contract[fn]({ value: valueWei })
            // tx resolves once MetaMask sends it; wait() resolves once it is mined
            const receipt = await tx.wait()
            interaction = { fn, ok: true, detail, hash: receipt.hash, time: new Date() }
        } catch (error) {
            interaction = { fn, ok: false, detail: `"${getRevertReason(error)}"`, hash: null, time: new Date() }
        }
        setInteractions((prev) => [interaction, ...prev])

        // Contract state, and the balances of both the signer and the contract, may have changed
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: contractKey(network, contractAddress) }),
            queryClient.invalidateQueries({ queryKey: addressKey(network, contractAddress) }),
            queryClient.invalidateQueries({ queryKey: addressKey(network, ethAddress) }),
        ])

        return { ok: interaction.ok, text: interaction.ok ? `Confirmed: ${detail}` : `Reverted: ${interaction.detail}` }
    }

    return (
        <main className="flex flex-col gap-6 px-20 py-6 text-left">
            <ContractSummary
                contractAddress={contractAddress}
                state={state.data}
                isPending={state.isPending}
                error={state.error}
            />

            <section className="flex flex-wrap items-start gap-6">
                <div className="min-w-0 grow-[999] basis-[600px]">
                    <ContractCode highlight={focus ? CONTRACT_RANGES[focus] ?? null : null} />
                </div>

                <div className="flex min-w-0 grow basis-[400px] flex-col gap-4">
                    {contract ? (
                        <>
                            <WalletCard
                                contractAddress={contractAddress}
                                leader={contract.leader}
                                ethAddress={ethAddress}
                            />
                            <ReadPanel
                                contractAddress={contractAddress}
                                leader={contract.leader}
                                counter={contract.counter}
                                wallet={contract.wallet}
                                signer={ethAddress}
                                onFocus={setFocus}
                            />
                            <WritePanel
                                counter={contract.counter}
                                wallet={contract.wallet}
                                onSend={send}
                                onFocus={setFocus}
                            />
                        </>
                    ) : (
                        <div className="rounded-xl border border-white/10 bg-[#171717] px-5 py-4 text-sm text-[#a1a1a1]">
                            {state.data?.deployed === false
                                ? "No contract found at the configured address. On anvil-local, deploy it from contracts/ with npx hardhat ignition deploy ignition/modules/CommunityCounter.ts --network local."
                                : "Loading contract…"}
                        </div>
                    )}
                </div>
            </section>

            <InteractionsTable interactions={interactions} />
        </main>
    )
}
