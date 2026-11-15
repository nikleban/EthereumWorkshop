import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { shortAddress } from "@/pages/SmartContract/contractSource"

export type Interaction = {
    fn: string
    ok: boolean
    detail: string
    // A reverted call fails in simulation and is never sent, so it has no hash
    hash: string | null
    time: Date
}

export const InteractionsTable = ({ interactions }: { interactions: Interaction[] }) => (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#171717]">
        <div className="flex items-baseline justify-between gap-3 px-5 py-4">
            <h2 className="text-sm font-medium">Your interactions</h2>
            <span className="text-xs text-[#8A8A8A]">Transactions sent from this page</span>
        </div>
        <Table className="min-w-[760px]">
            <TableHeader>
                <TableRow className="border-white/10 text-xs">
                    <TableHead className="px-5 text-[#8A8A8A]">Function</TableHead>
                    <TableHead className="text-[#8A8A8A]">Status</TableHead>
                    <TableHead className="text-[#8A8A8A]">Details</TableHead>
                    <TableHead className="text-[#8A8A8A]">Hash</TableHead>
                    <TableHead className="px-5 text-[#8A8A8A]">Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {interactions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="px-5 py-6 text-center text-[#8A8A8A]">
                            No transactions yet. Send one from the Write panel.
                        </TableCell>
                    </TableRow>
                ) : (
                    interactions.map((interaction, i) => (
                        <TableRow key={interaction.hash ?? i} className="border-white/[0.06]">
                            <TableCell className="px-5 font-mono">{interaction.fn}()</TableCell>
                            <TableCell>
                                <span className={`flex items-center gap-2 ${interaction.ok ? "text-green-400" : "text-red-400"}`}>
                                    <span className="size-1.5 rounded-full bg-current" />
                                    {interaction.ok ? "Confirmed" : "Reverted"}
                                </span>
                            </TableCell>
                            <TableCell className="whitespace-normal text-[#a1a1a1]">{interaction.detail}</TableCell>
                            <TableCell className="font-mono text-[#d4d4d4]" title={interaction.hash ?? undefined}>
                                {interaction.hash ? shortAddress(interaction.hash) : "—"}
                            </TableCell>
                            <TableCell className="px-5 text-[#a1a1a1]">{interaction.time.toLocaleTimeString()}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    </section>
)
