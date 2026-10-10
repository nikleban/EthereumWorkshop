import { useState } from "react"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router";

export function InsertAddress() {
    const [address, setAddress] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const ifSelectedNavigate = () => {
        if (!address.trim()) {
            setError("Please enter an ETH address")
            return
        }
        navigate(`/dashboard/${address}`)
    }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="input-address">Insert ETH Address</FieldLabel>
      <Input
        id="input-address"
        placeholder="0x...."
        value={address}
        onChange={(e) => {
          setAddress(e.target.value)
          if (error) setError("")
        }}
        aria-invalid={!!error}
        className="font-mono"
        autoComplete="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        data-bwignore
      />

      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        <FieldDescription>
          Paste an existing ETH address to inspect its activity
        </FieldDescription>
      )}
      <Button className="w-fit!" onClick={ifSelectedNavigate}>Inspect Address</Button>

    </Field>
  )
}
