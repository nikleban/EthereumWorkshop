import { useState } from "react"
import { formatEther, isAddress } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { shortAddress } from "@/pages/SmartContract/contractSource"
import { getCommunityCount, getRevertReason, isUserInCommunity } from "@blockchain/communityCounter"

type ReadPanelProps = {
    contractAddress: string
    leader: string
    counter: bigint
    wallet: bigint
    signer: string | null
    // Highlights a function or variable in the code, null clears it
    onFocus: (name: string | null) => void
}

export const ReadPanel = ({ contractAddress, leader, counter, wallet, signer, onFocus }: ReadPanelProps) => {
    const [countResult, setCountResult] = useState<string | null>(null)
    const [queryAddress, setQueryAddress] = useState("")
    const [queryResult, setQueryResult] = useState<{ ok: boolean; text: string } | null>(null)

    // Hover and keyboard focus both highlight the code
    const focusProps = (name: string) => ({
        onMouseEnter: () => onFocus(name),
        onMouseLeave: () => onFocus(null),
        onFocus: () => onFocus(name),
        onBlur: () => onFocus(null),
    })

    const callCount = async () => {
        try {
            setCountResult(String(await getCommunityCount(contractAddress)))
        } catch (error) {
            setCountResult(getRevertReason(error))
        }
    }

    const runQuery = async () => {
        const address = queryAddress.trim()
        if (!isAddress(address)) {
            setQueryResult({ ok: false, text: "Not a valid address (expected 0x + 40 hex characters)" })
            return
        }
        try {
            setQueryResult({ ok: true, text: `→ ${await isUserInCommunity(contractAddress, address)}` })
        } catch (error) {
            setQueryResult({ ok: false, text: getRevertReason(error) })
        }
    }

    const variables = [
        { name: "communityLeader", type: "address · public", value: shortAddress(leader), sub: signer?.toLowerCase() === leader.toLowerCase() ? "That is you" : "" },
        { name: "counter", type: "uint · public", value: counter.toString(), sub: "members" },
        { name: "wallet", type: "uint · public", value: wallet.toString(), sub: `≈ ${formatEther(wallet)} ETH (stored in wei)` },
    ]

    return (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171717]">
            <div className="flex items-baseline justify-between gap-3 px-5 pt-4 pb-3">
                <h2 className="text-sm font-medium">Read</h2>
                <span className="text-xs text-[#8A8A8A]">Free calls, no transaction</span>
            </div>

            {variables.map((variable) => (
                <div key={variable.name} {...focusProps(variable.name)} className="flex items-center justify-between gap-4 border-t border-white/[0.08] px-5 py-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-mono text-sm">{variable.name}</span>
                        <span className="text-xs text-[#8A8A8A]">{variable.type}</span>
                    </div>
                    <div className="flex min-w-0 flex-col items-end gap-0.5 text-right">
                        <span className="font-mono text-sm break-all">{variable.value}</span>
                        <span className="font-mono text-xs text-[#8A8A8A] break-all">{variable.sub}</span>
                    </div>
                </div>
            ))}

            <div {...focusProps("getCommunityCount")} className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] px-5 py-3">
                <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-sm">getCommunityCount()</span>
                    <span className="text-xs text-[#8A8A8A]">view · returns uint</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm ${countResult === null ? "text-[#8A8A8A]" : ""}`}>{countResult ?? "—"}</span>
                    <Button variant="outline" onClick={callCount}>Call</Button>
                </div>
            </div>

            <div {...focusProps("userIsInCommunity")} className="flex flex-col gap-2.5 border-t border-white/[0.08] px-5 pt-3 pb-4">
                <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor="member-query" className="font-mono text-sm">userIsInCommunity(address)</label>
                    <span className="text-xs text-[#8A8A8A]">returns bool</span>
                </div>
                <div className="flex gap-2">
                    <Input
                        id="member-query"
                        className="font-mono text-xs"
                        placeholder="0x… address"
                        value={queryAddress}
                        onChange={(e) => {
                            setQueryAddress(e.target.value)
                            setQueryResult(null)
                        }}
                        onKeyDown={(e) => e.key === "Enter" && runQuery()}
                    />
                    <Button variant="outline" onClick={runQuery}>Query</Button>
                </div>
                {queryResult && (
                    <p className={`font-mono text-xs ${!queryResult.ok ? "text-red-400" : queryResult.text.endsWith("true") ? "text-green-400" : "text-[#d4d4d4]"}`}>
                        {queryResult.text}
                    </p>
                )}
            </div>
        </div>
    )
}
