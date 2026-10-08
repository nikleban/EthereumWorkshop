import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HomePage() {
  return (
    <div className="flex p-2 gap-10">
        <Field>
            <FieldLabel htmlFor="input-demo-api-key">Insert Private Key</FieldLabel>
            <Input id="input-demo-api-key" type="password" placeholder="0x...." />
            <FieldDescription>
                Insert your private key to get data
            </FieldDescription>
        </Field>
        <Field>
            <FieldLabel htmlFor="input-demo-api-key">Generate Private Key</FieldLabel>
            <Button variant="outline">Generate</Button>
            <FieldDescription>
                Click to generate a private key
            </FieldDescription>
        </Field>
    </div>
  )
}
