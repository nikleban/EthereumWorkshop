import { useParams } from "react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashBoardHeader } from "@/pages/Dashboard/DashBoardHeader";
import { AddressOverview } from "@/pages/Dashboard/AddressOverview";
import { AnalyticsBubble } from "@/pages/Dashboard/AnalyticsBubble";
import { BalanceGraph } from "@/pages/Dashboard/BalanceGraph";
import { AccountDetails } from "@/pages/Dashboard/AccountDetails";
import { TransactionHistory } from "@/pages/Dashboard/transactions/TransactionHistory";
import { useNetwork } from "@/context/NetworkContext";
import { addressKey, addressOverviewQuery } from "@/queries/addressQueries";
import { NETWORKS } from "@blockchain/networks";
import { sendEthTest } from "@blockchain/walletActions";
import { Skeleton } from "@/components/ui/skeleton";


export const DashBoardPage = () => {
    const { ethAddress = "" } = useParams()
    const { network } = useNetwork()
    const queryClient = useQueryClient()
    const overview = useQuery({ ...addressOverviewQuery(network, ethAddress), enabled: !!ethAddress })

    const sendTestEth = async (amountWei?: bigint) => {
        // Resolves once the transaction is mined, on both local and Sepolia
        await sendEthTest(ethAddress, amountWei)
        // Balance, tx count and history all changed, refetch everything for this address
        await queryClient.invalidateQueries({ queryKey: addressKey(network, ethAddress) })
    }

    return (
        <div>
            <DashBoardHeader />
            <main className="px-20 py-6 text-left">
                {overview.isError ? (
                    <p className="text-red-500">{overview.error.message}</p>
                ) : overview.isPending ? (
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-7 w-[420px]" />
                        <Skeleton className="h-5 w-72" />
                    </div>
                ) : (
                    <AddressOverview
                        ethAddress={ethAddress}
                        balance={overview.data.balance}
                        isContract={overview.data.isContract}
                        onSendTestEth={NETWORKS[network]?.canFaucet ? sendTestEth : undefined}
                    />
                )}
                <AnalyticsBubble ethAddress={ethAddress} />
                <div className="flex gap-4 mt-5">
                    <div className="flex-[65] min-w-0">
                        <BalanceGraph ethAddress={ethAddress} />
                    </div>
                    <div className="flex-[35] min-w-0">
                        <AccountDetails ethAddress={ethAddress} />
                    </div>
                </div>
                <div className="mt-5">
                    <TransactionHistory ethAddress={ethAddress} />
                </div>
            </main>
        </div>
    )
};
