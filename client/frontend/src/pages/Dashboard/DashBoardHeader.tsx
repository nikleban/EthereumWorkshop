import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"
import { NetworkSwitch } from "@/components/NetworkSwitch"
import ethLogo from "@/assets/ethereum-eth-logo.svg"
import { Separator } from "@/components/ui/separator"


export const DashBoardHeader = () => {
    return (
        <div>
            <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 py-4">
                <div className="flex items-center gap-3 justify-self-start">
                    <img src={ethLogo} alt="Ethereum logo" className="h-6 w-6" />
                    <p className="font-bold">Ethereum Wallet Playground</p>
                </div>
                <InputGroup className="w-100">
                    <InputGroupInput placeholder="0x..." />
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton>Send</InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
                <div className="justify-self-end">
                    <NetworkSwitch />
                </div>
            </header>
            <Separator />
        </div>
    )
};