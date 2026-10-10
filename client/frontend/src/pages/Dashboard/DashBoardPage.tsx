import { useEffect, useState } from "react";
import { useParams } from "react-router"
import { DashBoardHeader } from "@/pages/Dashboard/DashBoardHeader";
import { AddressOverview } from "@/pages/Dashboard/AddressOverview";
import { useNetwork } from "@/context/NetworkContext";
import { getBalance, getTransactionCount, isEthAddressContract, sendEthTest } from "@blockchain/walletActions";


export const DashBoardPage = () => {
    const { ethAddress } = useParams()
    const { network, provider } = useNetwork()
    const [balance, setBalance] = useState<bigint | null>(null)
    const [txCount, setTxCount] = useState<number | null>(null)
    const [isContract, setIsContract] = useState<boolean | false>(false)
    const [error, setError] = useState<string | null>(null)
    // Bumped after a send so the effect below re-fetches
    const [refreshKey, setRefreshKey] = useState(0)

    const sendTestEth = async (amountWei: bigint) => {
        if (!ethAddress) return
        const transaction = await sendEthTest(provider, ethAddress, amountWei)
        if (!transaction) throw new Error("No funded test account could send")
        await transaction.wait()
        setRefreshKey((key) => key + 1)
    }

    useEffect(() => {
        if (!ethAddress) return

        let ignore = false
        setBalance(null)
        setTxCount(null)
        setError(null)

        const load = async () => {
            try {
                const [balance, transactionCount, isContract] = await Promise.all([
                    getBalance(provider, ethAddress),
                    getTransactionCount(provider, ethAddress),
                    isEthAddressContract(provider, ethAddress)
                ])
                if (ignore) return
                setBalance(balance)
                setTxCount(transactionCount)
                setIsContract(isContract)
            } catch (e) {
                if (!ignore) setError(e instanceof Error ? e.message : String(e))
            }
        }
        load()

        return () => { ignore = true }
    }, [provider, ethAddress, refreshKey])

    return (
        <div>
            <DashBoardHeader />
            <main className="px-20 py-6 text-left">
                {ethAddress && <AddressOverview ethAddress={ethAddress} balance={balance} isContract={isContract}
                    onSendTestEth={network === "sepolia" ? sendTestEth : undefined} />}
                {error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <p>Transactions sent: {txCount === null ? "Loading…" : txCount}</p>
                )}
                {/* <AnalyticsBubble />
                <BalanceGraph />
                <AccountDetails />
                <TransactionHistory /> */}
            </main>
        </div>
    )
};
