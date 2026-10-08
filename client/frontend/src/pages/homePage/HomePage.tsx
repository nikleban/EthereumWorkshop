import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { InsertPrivateKey } from "@/pages/homePage/InsertPrivateKey"
import { GeneratePrivateKey } from "@/pages/homePage/GeneratePrivateKey"

export function HomePage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl">Ethereum Wallet Playground</CardTitle>
          <CardDescription>
            Insert an existing private key, or generate a new one to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <InsertPrivateKey />
          <GeneratePrivateKey />
        </CardContent>
      </Card>
    </div>
  )
}
