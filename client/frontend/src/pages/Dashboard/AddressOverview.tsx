import { useState } from "react";
import { formatEther } from "ethers";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import { SendTestEth } from "@/pages/Dashboard/SendTestEth";

type AddressOverviewProps = {
    ethAddress: string
    balance: bigint | null
    isContract: boolean
    // Only passed on the testnet; the send form is hidden without it
    onSendTestEth?: (amountWei: bigint) => Promise<void>
}

export const AddressOverview = ({ ethAddress, balance, isContract, onSendTestEth }: AddressOverviewProps) => {
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        await navigator.clipboard.writeText(ethAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <div>
            <div className="gap-5">
                {isContract ? <Badge className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" variant="outline"><CheckIcon />Is Contract</Badge>
                : <Badge className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" variant="outline"><CheckIcon />Is Externally owned</Badge>}
                {!!balance && <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" variant="secondary"><CheckIcon />Is active</Badge>}
            </div>
            <div className="flex items-center justify-between gap-5">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-5">
                        <p className="font-bold text-lg">{ethAddress}</p>
                        <Button onClick={copy} variant="outline">{copied ? <CheckIcon /> : <CopyIcon />}copy</Button>
                    </div>
                    <p>Balance: {balance === null ? "Loading…" : `${formatEther(balance)} ETH`}</p>
                </div>
                {onSendTestEth && <SendTestEth onSend={onSendTestEth} />}
            </div>
        </div>
    )
};
