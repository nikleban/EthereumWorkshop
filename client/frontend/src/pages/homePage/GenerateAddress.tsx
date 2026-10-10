import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import { generateRandomETHAddress } from "@blockchain/walletActions"

export function GenerateAddress() {
  const [address, setAddress] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = () => {
    setAddress(generateRandomETHAddress())
  }

  const copy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Field>
      <FieldLabel htmlFor="generated-address">Generate ETH Address</FieldLabel>
      {address ? (
        <ButtonGroup>
          <ButtonGroupText
            id="generated-address"
            className="flex-1 truncate font-mono"
          >
            {address}
          </ButtonGroupText>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Copy address"
            onClick={copy}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </ButtonGroup>
      ) : (
        <Button variant="outline" onClick={generate} className="w-fit">
          Generate
        </Button>
      )}
      <FieldDescription>
        Click to generate a brand new random ETH address
      </FieldDescription>
    </Field>
  )
}
