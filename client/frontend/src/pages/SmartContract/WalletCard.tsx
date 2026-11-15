import { useQuery } from "@tanstack/react-query"
import { formatEther } from "ethers"
import { useNetwork } from "@/context/NetworkContext"
import { addressOverviewQuery } from "@/queries/addressQueries"
import { membershipQuery } from "@/queries/contractQueries"
import { shortAddress } from "@/pages/SmartContract/contractSource"

type WalletCardProps = {
    contractAddress: string
    leader: string
    // The address from the dashboard URL
    ethAddress: string
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex justify-between gap-4 border-t border-white/[0.08] py-2.5 text-sm">
        <span className="text-[#a1a1a1]">{label}</span>
        {children}
    </div>
)

export const WalletCard = ({ contractAddress, leader, ethAddress }: WalletCardProps) => {
    const { network } = useNetwork()
    const balance = useQuery(addressOverviewQuery(network, ethAddress))
    const isMember = useQuery(membershipQuery(network, contractAddress, ethAddress))
    const isLeader = ethAddress.toLowerCase() === leader.toLowerCase()

    return (
        <div className="flex flex-col gap-3.5 rounded-xl border border-white/10 bg-[#171717] px-5 py-4">
            <h2 className="text-sm font-medium">Your wallet</h2>
            <div className="flex flex-col">
                <Row label="Address"><span className="font-mono">{shortAddress(ethAddress)}</span></Row>
                <Row label="Balance">
                    <span className="font-mono">
                        {balance.data ? `${Number(formatEther(balance.data.balance)).toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH` : "—"}
                    </span>
                </Row>
                <Row label="Role"><span>{isLeader ? "Community leader" : "Regular wallet"}</span></Row>
                <Row label="Membership">
                    <span className={`inline-flex items-center gap-2 ${isMember.data ? "text-green-400" : "text-[#a1a1a1]"}`}>
                        <span className={`size-1.5 rounded-full ring-1 ring-current ${isMember.data ? "bg-green-400" : ""}`} />
                        {isMember.isPending ? "—" : isMember.data ? "In the community" : "Not a member"}
                    </span>
                </Row>
            </div>
        </div>
    )
}
