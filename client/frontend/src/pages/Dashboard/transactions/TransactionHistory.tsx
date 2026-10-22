import { useMemo, useState } from "react";
import { columns, type Transaction } from "./columns"
import { DataTable } from "./data-table"
import { transactionHistoryQuery } from "@/queries/addressQueries";
import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "@/context/NetworkContext";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton";

type Filter = "all" | Transaction["type"]

interface TransactionHistoryProps {
    ethAddress: string
}

export const TransactionHistory = ({ethAddress}: TransactionHistoryProps) => {
    const { network } = useNetwork()
    const { data, isPending, isError, error } = useQuery(transactionHistoryQuery(network, ethAddress))

    const transactions = useMemo<Transaction[]>(() => {
        const me = ethAddress.toLowerCase();
        const allTransfers = (data?.fromTransactions ?? []).concat(data?.toTransactions ?? []);

        return allTransfers
            .map((transfer): Transaction => {
                const isSent = transfer.from?.toLowerCase() === me;
                return {
                    type: isSent ? "Sent" : "Received",
                    hash: transfer.hash,
                    counterParty: (isSent ? transfer.to : transfer.from) ?? "—",
                    value: transfer.value ?? 0,
                    date: new Date(transfer.metadata.blockTimestamp),
                };
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // newest first
    }, [data, ethAddress]);

    const [filter, setFilter] = useState<Filter>("all")

    const visibleTransactions = useMemo(
        () => filter === "all" ? transactions : transactions.filter((transaction) => transaction.type === filter),
        [transactions, filter],
    );

    if (isError) return <p className="text-red-500">{error.message}</p>
    if (isPending) return (
        <div className="bg-[#171717] border rounded-lg h-full p-2 space-y-2">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-8 w-48" />
            </div>
            {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
            ))}
        </div>
    )

    return (
        <div className="bg-[#171717] border rounded-lg h-full">
            <div className="flex justify-between p-2">
                <p>Transaction history</p>
                {/* Base UI hands back an array of pressed values; it's empty when the active item is clicked again, so keep the current filter then */}
                <ToggleGroup
                    variant="outline"
                    value={[filter]}
                    onValueChange={(value) => value[0] && setFilter(value[0] as Filter)}
                >
                    <ToggleGroupItem value="all" aria-label="Show all">All</ToggleGroupItem>
                    <ToggleGroupItem value="Received" aria-label="Show received">Received</ToggleGroupItem>
                    <ToggleGroupItem value="Sent" aria-label="Show sent">Sent</ToggleGroupItem>
                </ToggleGroup>
            </div>
            <DataTable columns={columns} data={visibleTransactions} />
        </div>
    )
}
