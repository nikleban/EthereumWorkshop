import { useState } from "react"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"
import { NetworkSwitch } from "@/components/NetworkSwitch"
import ethLogo from "@/assets/ethereum-eth-logo.svg"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router";
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"

export const PAGES = {
    dashboard: { label: "Dashboard" },
    contract: { label: "Smart contract" },
} as const

export type Page = keyof typeof PAGES

type DashBoardHeaderProps = {
    page: Page
    onPageChange: (page: Page) => void
}

export const DashBoardHeader = ({ page, onPageChange }: DashBoardHeaderProps) => {
    const [address, setAddress] = useState("")
    const navigate = useNavigate()
    const [error, setError] = useState("")


    const ifSelectedNavigate = () => {
        if (!address.trim()) {
            setError("Please enter an ETH address")
            return
        }
        navigate(`/dashboard/${address}`)
    }

    return (
        <div>
            <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 py-4">
                <div className="flex items-center gap-3 justify-self-start">
                    <img src={ethLogo} alt="Ethereum logo" className="h-6 w-6" />
                    <p className="font-bold">Ethereum Address dashboard</p>
                    <ButtonGroup>
                        {Object.entries(PAGES).map(([key, { label }]) => (
                            <Button
                                key={key}
                                size="sm"
                                variant={page === key ? "default" : "outline"}
                                onClick={() => onPageChange(key as Page)}
                            >
                                {label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
                <div className="relative w-100">
                    <InputGroup>
                        <InputGroupInput
                            aria-invalid={!!error}
                            onChange={(e) => {
                                setAddress(e.target.value)
                                if (error) setError("")
                            }}
                            onKeyDown={(e) => e.key === "Enter" && ifSelectedNavigate()}
                            placeholder="0x..." />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton onClick={ifSelectedNavigate}>Inspect</InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                    {/* Absolute, so the message doesn't push the header taller */}
                    {error && <p className="absolute top-full mt-1 text-xs text-red-400">{error}</p>}
                </div>
                <div className="justify-self-end">
                    <NetworkSwitch />
                </div>
            </header>
            <Separator />
        </div>
    )
};