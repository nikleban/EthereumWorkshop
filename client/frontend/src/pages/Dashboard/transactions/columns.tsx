import { createColumnHelper } from "@tanstack/react-table"
import { MoveUpRight } from 'lucide-react';
import { MoveDownLeft } from 'lucide-react';
import { MoreHorizontal } from "lucide-react"

import { type DataTableFeatures } from "./data-table-features"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Transaction = {
    type: "Sent" | "Received"
    hash: string
    counterParty: string
    value: number
    date: Date
};

const shorten = (value: string) =>
    value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;

const columnHelper = createColumnHelper<DataTableFeatures, Transaction>()

export const columns = columnHelper.columns([
  columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => <div className="flex p-1 gap-2">{info.getValue() === "Received" ? <MoveDownLeft /> : <MoveUpRight /> }<span title={info.getValue()}>{info.getValue()}</span></div>,
    }),
    columnHelper.accessor("hash", {
        header: "Hash",
        // title shows the full value on hover
        cell: (info) => <span title={info.getValue()}>{shorten(info.getValue())}</span>,
    }),
    columnHelper.accessor("counterParty", {
        header: "CounterParty",
        cell: (info) => <span title={info.getValue()}>{shorten(info.getValue())}</span>,
    }),
    columnHelper.accessor("value", {
        header: "Value (ETH)",
    }),
    columnHelper.accessor("date", {
        header: "Date",
        // React can't render a Date object, so format it to text
        cell: (info) => info.getValue().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    }),
    columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="end">
            {/* Base UI requires a label to live inside a group */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(transaction.hash)}
              >
                Copy hash address
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }),
])