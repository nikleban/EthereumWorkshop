import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "@/context/NetworkContext";
import { transactionHistoryQuery } from "@/queries/addressQueries";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

type AnalyticsBubbleProps = {
    ethAddress: string,
}

export const AnalyticsBubble = ({ethAddress}: AnalyticsBubbleProps) => {
    const { network } = useNetwork()
    const { data, isPending, isError, error } = useQuery(transactionHistoryQuery(network, ethAddress))
    
    if (isError) return <p className="text-red-500">{error.message}</p>
    if (isPending || !data) return <p>Loading history…</p>

    const getEthAmount = (transactions: any[]) => {
        let totalEth = 0;
        for (const transaction of transactions) {
            if (transaction.asset === "ETH") totalEth += transaction.value;
        }
        return totalEth.toLocaleString(undefined, { maximumFractionDigits: 4 });
    };

    const getUniqueAddresses = (transactions: any[]) => {
        const uniqueAddresses = new Set<string>();
        const me = ethAddress.toLowerCase();
        for (const transaction of transactions) {
            const counterparty = transaction.from?.toLowerCase() === me ? transaction.to : transaction.from;
            if (counterparty) uniqueAddresses.add(counterparty.toLowerCase());
        }
        return uniqueAddresses.size;
    };

    const getMostActiveMonth = (transactions: any[]) => {
        const monthDict = new Map<number, number>()
        for (const transaction of transactions) {
            const date = new Date(transaction.metadata.blockTimestamp)
            const month = date.getMonth() + 1;
            monthDict.set(month, (monthDict.get(month) ?? 0) + 1);
        }
        let maxTransactions = 0;
        let month = "";
        for (const [monthNumber, count] of monthDict) {
            if (count > maxTransactions) {
                maxTransactions = count;
                month = MONTH_NAMES[monthNumber - 1];
            }
        }
        return { month, count: maxTransactions };
    };

    const mostActiveMonth = getMostActiveMonth(data.toTransactions.concat(data.fromTransactions));

    return (
        <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg mt-5 grid grid-cols-5 divide-x divide-[#2a2a2a]">
            <div className="px-6 py-5 space-y-1">
                <p className="text-[#8A8A8A]">Transactions</p>
                <p className="text-xl">{data.fromCount + data.toCount}</p>
                <p className="text-[#8A8A8A] text-sm">{data.fromCount} sent · {data.toCount} recieved</p>
            </div>
            <div className="px-6 py-5 space-y-1">
                <p className="text-[#8A8A8A]">Total recieved</p>
                <p className="text-xl">{getEthAmount(data.toTransactions)} ETH</p>
                <p className="text-[#8A8A8A] text-sm">{data.toCount} incoming</p>
            </div>
            <div className="px-6 py-5 space-y-1">
                <p className="text-[#8A8A8A]">Total sent</p>
                <p className="text-xl">{getEthAmount(data.fromTransactions)} ETH</p>
                <p className="text-[#8A8A8A] text-sm">{data.fromCount} outgoing</p>
            </div>
            <div className="px-6 py-5 space-y-1">
                <p className="text-[#8A8A8A]">Most active month</p>
                <p className="text-xl">{mostActiveMonth.month || "—"}</p>
                <p className="text-[#8A8A8A] text-sm">{mostActiveMonth.count} transactions</p>
            </div>
            <div className="px-6 py-5 space-y-1">
                <p className="text-[#8A8A8A]">Counterparties</p>
                <p className="text-xl">{getUniqueAddresses(data.toTransactions.concat(data.fromTransactions))}</p>
                <p className="text-[#8A8A8A] text-sm">Unique addresses interacted</p>
            </div>
        </div>
    )
}
