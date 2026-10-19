import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { transactionHistoryQuery } from "@/queries/addressQueries";
import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "@/context/NetworkContext";

type BalanceGraphProps = {
    ethAddress: string,
}

type BalancePoint = {
    time: number,
    balance: number,
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Number of days to show; null means the whole history
const RANGES = { "30D": 30, "180D": 180, "All": null } as const;
type Range = keyof typeof RANGES;

const formatDay = (time: number) =>
    new Date(time).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "2-digit" });

// Turns Alchemy transfers into a running balance, one point per day.
// Gas isn't included, so the last point sits slightly above the real balance.
const getBalancePoints = (transactions: any[], ethAddress: string): BalancePoint[] => {
    const me = ethAddress.toLowerCase();

    const ethTransfers = transactions
        .filter((transaction) => transaction.asset === "ETH")
        .sort((a, b) => new Date(a.metadata.blockTimestamp).getTime() - new Date(b.metadata.blockTimestamp).getTime());

    // Keyed by the start of each day; a later transfer on the same day overwrites the earlier
    // balance, so each day keeps its end-of-day balance. Map keeps the sorted order.
    let balance = 0;
    const balanceByDay = new Map<number, number>();
    for (const transaction of ethTransfers) {
        if (transaction.to?.toLowerCase() === me) balance += transaction.value;
        if (transaction.from?.toLowerCase() === me) balance -= transaction.value;

        const day = new Date(transaction.metadata.blockTimestamp);
        day.setHours(0, 0, 0, 0);
        balanceByDay.set(day.getTime(), Number(balance.toFixed(15)));
    }
    return Array.from(balanceByDay, ([time, balance]) => ({ time, balance }));
};

// Cuts the points down to the chosen range. The balance carries over from before the range,
// so the line starts at the right height, and it's extended to today so the last step isn't cut off.
const getPointsInRange = (points: BalancePoint[], days: number | null): BalancePoint[] => {
    const now = Date.now();
    const lastBalance = points.at(-1)?.balance ?? 0;

    if (days === null) return [...points, { time: now, balance: lastBalance }];

    const start = now - days * DAY_MS;
    const balanceAtStart = points.findLast((point) => point.time < start)?.balance ?? 0;
    const inRange = points.filter((point) => point.time >= start);

    return [{ time: start, balance: balanceAtStart }, ...inRange, { time: now, balance: lastBalance }];
};

export const BalanceGraph = ({ethAddress}: BalanceGraphProps) => {
    const { network } = useNetwork()
    const { data, isPending, isError, error } = useQuery(transactionHistoryQuery(network, ethAddress))
    const [range, setRange] = useState<Range>("30D")

    if (isError) return <p className="text-red-500">{error.message}</p>
    if (isPending || !data) return <p>Loading history…</p>

    const allPoints = getBalancePoints(data.fromTransactions.concat(data.toTransactions), ethAddress);
    const points = getPointsInRange(allPoints, RANGES[range]);

    return (
        <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg p-5 h-full">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[#8A8A8A]">Balance over time</p>
                <ButtonGroup>
                    {(Object.keys(RANGES) as Range[]).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={range === key ? "default" : "outline"}
                            onClick={() => setRange(key)}
                        >
                            {key}
                        </Button>
                    ))}
                </ButtonGroup>
            </div>
            <AreaChart
                style={{ width: '100%', height: 300 }}
                responsive
                data={points}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid stroke="#2a2a2a" vertical={false} />
                {/* Numeric time axis: days are spaced by real time, not one slot per point */}
                <XAxis
                    dataKey="time"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={formatDay}
                    minTickGap={40}
                    stroke="#8A8A8A"
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis width="auto" stroke="#8A8A8A" tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ background: "#171717", border: "1px solid #2a2a2a", borderRadius: 8 }}
                    labelFormatter={(time) => formatDay(Number(time))}
                    formatter={(value) => [`${value} ETH`, "Balance"]}
                />
                <Area type="stepAfter" dataKey="balance" stroke="#c084fc" strokeWidth={2} fill="url(#balanceFill)" />
            </AreaChart>
        </div>
    )
}
