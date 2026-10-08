import { useState } from "react"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function InsertPrivateKey() {
  const [value, setValue] = useState("")

  return (
    <Field>
      <FieldLabel htmlFor="input-private-key">Insert Private Key</FieldLabel>
      <Input
        id="input-private-key"
        type="password"
        placeholder="0x...."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="font-mono"
      />
      <FieldDescription>
        Paste an existing private key to inspect its wallet
      </FieldDescription>
    </Field>
  )
}
