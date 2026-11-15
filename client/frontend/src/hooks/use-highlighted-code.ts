import { useEffect, useState, type ReactNode } from "react"

import { highlightSolidity } from "@/lib/highlighter"

// Plain text lines until Shiki loads, then highlighted ones
export function useHighlightedCode(code: string) {
  const plain = code.replace(/\n$/, "").split("\n")
  const [lines, setLines] = useState<ReactNode[] | null>(null)

  useEffect(() => {
    let cancelled = false
    highlightSolidity(code)
      .then((next) => !cancelled && setLines(next))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [code])

  return lines ?? plain
}
