import { useNetwork } from "@/context/NetworkContext";
import { transactionHistoryQuery } from "@/queries/addressQueries";
import { useQuery } from "@tanstack/react-query";
import { addressOverviewQuery } from "@/queries/addressQueries";


type AccountDetailsProps = {
    ethAddress: string,
}

export const AccountDetails = ({ethAddress}: AccountDetailsProps) => {
    const { network } = useNetwork()
    const history = useQuery(transactionHistoryQuery(network, ethAddress))
    const overview = useQuery(addressOverviewQuery(network, ethAddress))
    
    if (history.isError) return <p className="text-red-500">{history.error.message}</p>
    if (overview.isError) return <p className="text-red-500">{overview.error.message}</p>
    if (history.isPending || overview.isPending) return <p>Loading…</p>

    console.log(overview.data)
    
    return (
        <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg divide-y divide-[#2a2a2a] h-full grid grid-rows-6">
            <p>1</p>
            <p>1</p>
            <p>1</p>
            <p>1</p>
            <p>1</p>
            <p>1</p>
        </div>
    )
}