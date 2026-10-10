import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { NetworkSwitch } from "@/components/NetworkSwitch"
import { GenerateAddress } from "@/pages/homePage/GenerateAddress"
import { InsertAddress } from "@/pages/homePage/InsertAddress";

export function HomePage() {
  return (
    <>
        <div className="fixed top-0 right-0 p-6">
            <NetworkSwitch />
        </div>
        <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-xl">
            <CardHeader>
            <CardTitle className="text-xl">Ethereum Wallet Playground</CardTitle>
            <CardDescription>
                Insert an existing ETH address, or generate a new one to get started.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <InsertAddress />
                <GenerateAddress />
            </CardContent>
        </Card>
        </div>
    </>
  )
}
