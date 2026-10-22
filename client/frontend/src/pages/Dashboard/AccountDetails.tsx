import { useNetwork } from "@/context/NetworkContext";
import { transactionHistoryQuery } from "@/queries/addressQueries";
import { useQuery } from "@tanstack/react-query";
import { addressOverviewQuery } from "@/queries/addressQueries";
import { Skeleton } from "@/components/ui/skeleton";


type AccountDetailsProps = {
    ethAddress: string,
}

export const AccountDetails = ({ethAddress}: AccountDetailsProps) => {
    const { network } = useNetwork()
    const history = useQuery(transactionHistoryQuery(network, ethAddress))
    const overview = useQuery(addressOverviewQuery(network, ethAddress))
    
    if (history.isError) return <p className="text-red-500">{history.error.message}</p>
    if (overview.isError) return <p className="text-red-500">{overview.error.message}</p>
    if (history.isPending || overview.isPending) return (
        <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg h-full p-2 flex flex-col">
            <Skeleton className="h-5 w-32" />
            <div className="divide-y divide-[#2a2a2a] grid grid-rows-6 flex-1">
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 px-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                ))}
            </div>
        </div>
    )

    const existsText = overview.data.balance || overview.data.txCount > 0 ? "Yes, has on-chain state" : "No, it doesn't exist";
    const isExternalAccountText = overview.data.isContract ? "Contract code, not an EOA" : "EOA, not a contract";


    // Oldest first, so the first transaction is at the start and the last one at the end
    // history.data is undefined on the local network until that branch is implemented
    const allTransactions = (history.data?.fromTransactions ?? [])
        .concat(history.data?.toTransactions ?? [])
        .sort((a, b) => new Date(a.metadata.blockTimestamp).getTime() - new Date(b.metadata.blockTimestamp).getTime());
    const firstTransaction = allTransactions[0];
    const lastTransaction = allTransactions.at(-1);

    const start = Date.now() - 30 * 24 * 60 * 60 * 1000;   // 30 days ago
    const end = Date.now();
    const inRange = allTransactions.filter((transaction) => {
        const time = new Date(transaction.metadata.blockTimestamp).getTime();
        return time >= start && time <= end;
    });
    const activityText = `${inRange.length ? "Active" : "Inactive"}, ${inRange.length} transactions in 30 days`

    const formatDate = (transaction?: any) =>
        transaction
            ? new Date(transaction.metadata.blockTimestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "—";

    return (
        <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg h-full p-2 flex flex-col">
            <p>Account details</p>
            <div className="divide-y divide-[#2a2a2a] grid grid-rows-6 flex-1">
                <div className="flex items-center justify-between gap-4 px-3">
                    <p className="text-[#8A8A8A] text-sm">Exists</p>
                    <p>{existsText}</p>
                </div>
                <div className="flex items-center justify-between gap-4 px-3">
                    <p className="text-[#8A8A8A] text-sm">Activity</p>
                    <p>{activityText}</p>
                </div>
                <div className="flex items-center justify-between gap-4 px-3">
                    <p className="text-[#8A8A8A] text-sm">Account type</p>
                    <p>{isExternalAccountText}</p>
                </div>
                <div className="flex items-center justify-between gap-4 px-3">
                    <p className="text-[#8A8A8A] text-sm">Nonce</p>
                    <p>{overview.data.txCount}</p>
                </div>
                <div className="flex items-center justify-between gap-4 px-3">
                    <p className="text-[#8A8A8A] text-sm">First seen</p>
                    <p>{formatDate(firstTransaction)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 px-3">
                    <p className="text-[#8A8A8A] text-sm">Last transaction</p>
                    <p>{formatDate(lastTransaction)}</p>
                </div>
            </div>
        </div>
    )
}