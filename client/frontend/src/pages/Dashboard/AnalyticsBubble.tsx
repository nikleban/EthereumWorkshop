import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "@/context/NetworkContext";
import { transactionHistoryQuery } from "@/queries/addressQueries";

type AnalyticsBubbleProps = {
    ethAddress: string,
}

export const AnalyticsBubble = ({ethAddress}: AnalyticsBubbleProps) => {
    const { network } = useNetwork()
    const { data, isPending, isError, error } = useQuery(transactionHistoryQuery(network, ethAddress))

    if (isPending) return <p>Loading history…</p>
    if (isError) return <p className="text-red-500">{error.message}</p>

    return (
        <div className="bg-gray-950 rounded">
            from: {data?.fromCount}, to: {data?.toCount},
        </div>
    )
}
