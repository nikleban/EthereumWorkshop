import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { useNetwork } from "@/context/NetworkContext"

export function NetworkSwitch() {
  const { network, setNetwork } = useNetwork()

  return (
    <Field orientation="horizontal" className="w-fit">
      <FieldLabel htmlFor="network-switch">eth-mainnet</FieldLabel>
      <Switch
        id="network-switch"
        checked={network === "sepolia"}
        onCheckedChange={(checked) => setNetwork(checked ? "sepolia" : "mainnet")}
      />
      <FieldLabel htmlFor="network-switch">eth-sepolia</FieldLabel>
    </Field>
  )
}
