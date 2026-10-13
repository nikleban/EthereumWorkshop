import { useState } from "react";
import { parseEther } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNetwork } from "@/context/NetworkContext";

type SendTestEthProps = {
    onSend: (amountWei?: bigint) => Promise<void>
}

export const SendTestEth = ({ onSend }: SendTestEthProps) => {
    // Only Anvil lets you choose how much to send, the Sepolia faucet sends a fixed amount
    const canChooseAmount = useNetwork().network === "local"
    const [amount, setAmount] = useState("")
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const send = async () => {
        setError(null)
        let amountWei: bigint | undefined
        if (canChooseAmount) {
            try {
                amountWei = parseEther(amount)
            } catch {
                setError("Enter a valid ETH amount")
                return
            }
        }

        setSending(true)
        try {
            await onSend(amountWei)
            setAmount("")
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                {canChooseAmount && (
                    <Input
                        className="w-32"
                        placeholder="0.1..."
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={sending}
                    />
                )}
                <Button onClick={send} disabled={sending || (canChooseAmount && !amount)}>
                    {sending ? "Sending…" : canChooseAmount ? "Send test ETH" : "Get test ETH"}
                </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
};
