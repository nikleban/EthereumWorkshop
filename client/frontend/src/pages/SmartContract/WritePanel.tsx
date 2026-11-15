import { useState } from "react"
import { formatEther, parseEther } from "ethers"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"

export type WriteFn = "joinCommunity" | "leaveCommunity" | "donateToCommunity" | "withdrawFundsFromCommunity"

export type TxResult = { ok: boolean; text: string }

type WritePanelProps = {
    counter: bigint
    wallet: bigint
    // Sends the transaction; detail is what to log if it confirms
    onSend: (fn: WriteFn, detail: string, valueWei?: bigint) => Promise<TxResult>
    onFocus: (name: string | null) => void
}

const WRITES: { fn: WriteFn; label: string; desc: string; payable?: boolean }[] = [
    { fn: "joinCommunity", label: "Join community", desc: "Adds your address to the community and increases the counter by 1." },
    { fn: "leaveCommunity", label: "Leave community", desc: "Removes your address from the community and decreases the counter by 1." },
    { fn: "donateToCommunity", label: "Donate", desc: "Sends ETH with the call (msg.value). It is added to the community wallet.", payable: true },
    { fn: "withdrawFundsFromCommunity", label: "Withdraw funds", desc: "Sends the whole community wallet to the leader. Anyone else gets a revert." },
]

export const WritePanel = ({ counter, wallet, onSend, onFocus }: WritePanelProps) => {
    const [busy, setBusy] = useState<WriteFn | null>(null)
    const [results, setResults] = useState<Partial<Record<WriteFn, TxResult>>>({})
    const [amount, setAmount] = useState("0.1")

    const run = async (fn: WriteFn) => {
        let valueWei: bigint | undefined
        if (fn === "donateToCommunity") {
            try {
                valueWei = parseEther(amount.trim())
            } catch {
                setResults((prev) => ({ ...prev, [fn]: { ok: false, text: "Enter an amount in ETH, e.g. 0.1" } }))
                return
            }
        }
        const detail = {
            joinCommunity: `counter ${counter} → ${counter + 1n}`,
            leaveCommunity: `counter ${counter} → ${counter - 1n}`,
            donateToCommunity: `Donated ${amount.trim()} ETH`,
            withdrawFundsFromCommunity: `Withdrew ${formatEther(wallet)} ETH to the leader`,
        }[fn]
                
        setBusy(fn)
        const result = await onSend(fn, detail, valueWei)
        setResults((prev) => ({ ...prev, [fn]: result }))
        setBusy(null)
    }

    return (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171717]">
            <div className="flex items-baseline justify-between gap-3 px-5 pt-4 pb-3">
                <h2 className="text-sm font-medium">Write</h2>
                <span className="text-xs text-[#8A8A8A]">Sends a transaction, costs gas</span>
            </div>

            {WRITES.map(({ fn, label, desc, payable }) => {
                const result = results[fn]
                return (
                    <div
                        key={fn}
                        onMouseEnter={() => onFocus(fn)}
                        onMouseLeave={() => onFocus(null)}
                        onFocus={() => onFocus(fn)}
                        onBlur={() => onFocus(null)}
                        className="flex flex-col gap-2.5 border-t border-white/[0.08] px-5 pt-3.5 pb-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-sm">{fn}()</span>
                            <span className={`inline-flex h-5.5 items-center rounded-full border px-2 text-[11px] ${payable ? "border-purple-400/50 text-purple-300" : "border-white/[0.12] text-[#a1a1a1]"}`}>
                                {payable ? "payable" : "nonpayable"}
                            </span>
                        </div>
                        <p className="text-xs text-[#a1a1a1]">{desc}</p>
                        <div className="flex gap-2">
                            {payable && (
                                <InputGroup>
                                    <InputGroupInput
                                        inputMode="decimal"
                                        aria-label="Amount to donate in ETH"
                                        className="font-mono text-sm"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <InputGroupText>ETH</InputGroupText>
                                    </InputGroupAddon>
                                </InputGroup>
                            )}
                            <Button
                                className={payable ? "shrink-0" : "flex-1"}
                                disabled={busy !== null}
                                onClick={() => run(fn)}
                            >
                                {busy === fn ? "Waiting for confirmation…" : label}
                            </Button>
                        </div>
                        {result && (
                            <p className={`flex items-start gap-2 text-xs ${result.ok ? "text-green-400" : "text-red-400"}`}>
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
                                <span>{result.text}</span>
                            </p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
