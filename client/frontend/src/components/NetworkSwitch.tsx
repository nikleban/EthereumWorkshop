import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { useNetwork, type Network } from "@/context/NetworkContext"
import { NETWORKS } from "@blockchain/networks"

// One button per entry in NETWORKS, so "local" shows up in dev only
export function NetworkSwitch() {
  const { network, setNetwork } = useNetwork()

  return (
    <ButtonGroup>
      {Object.entries(NETWORKS).map(([key, { label }]) => (
        <Button
          key={key}
          size="sm"
          variant={network === key ? "default" : "outline"}
          onClick={() => setNetwork(key as Network)}
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  )
}
