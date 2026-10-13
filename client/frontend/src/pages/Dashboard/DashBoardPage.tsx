import { useParams } from "react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashBoardHeader } from "@/pages/Dashboard/DashBoardHeader";
import { AddressOverview } from "@/pages/Dashboard/AddressOverview";
import { AnalyticsBubble } from "@/pages/Dashboard/AnalyticsBubble";
import { useNetwork } from "@/context/NetworkContext";
import { addressKey, addressOverviewQuery } from "@/queries/addressQueries";
import { NETWORKS } from "@blockchain/networks";
import { sendEthTest } from "@blockchain/walletActions";


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
                {ethAddress && <AddressOverview ethAddress={ethAddress}
                    balance={overview.data?.balance ?? null}
                    isContract={overview.data?.isContract ?? false}
                    onSendTestEth={NETWORKS[network]?.canFaucet ? sendTestEth : undefined} />}
                {overview.isError ? (
                    <p className="text-red-500">{overview.error.message}</p>
                ) : (
                    <p>Transactions sent: {overview.data?.txCount ?? "Loading…"}</p>
                )}
                {ethAddress && <AnalyticsBubble ethAddress={ethAddress}/>}
                {/*
                <BalanceGraph />
                <AccountDetails />
                <TransactionHistory /> */}
            </main>
        </div>
    )
};
