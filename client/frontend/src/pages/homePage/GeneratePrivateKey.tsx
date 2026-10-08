import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import { generateRandomPrivateKey } from "@blockchain/walletActions"

export function GeneratePrivateKey() {
  const [privateKey, setPrivateKey] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = () => {
    setPrivateKey(generateRandomPrivateKey())
  }

  const copy = async () => {
    if (!privateKey) return
    await navigator.clipboard.writeText(privateKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Field>
      <FieldLabel htmlFor="generated-private-key">Generate Private Key</FieldLabel>
      {privateKey ? (
        <ButtonGroup>
          <ButtonGroupText
            id="generated-private-key"
            className="flex-1 truncate font-mono"
          >
            {privateKey}
          </ButtonGroupText>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Copy private key"
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
        Click to generate a brand new random private key
      </FieldDescription>
    </Field>
  )
}
