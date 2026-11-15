import type { CSSProperties } from "react"
import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"

let highlighter: Promise<HighlighterCore> | undefined

// Loaded on first use, so Shiki stays out of the main bundle
const getHighlighter = () =>
  (highlighter ??= createHighlighterCore({
    themes: [import("shiki/themes/github-dark.mjs")],
    langs: [import("shiki/langs/solidity.mjs")],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  }))

// One React node per line of the source
export async function highlightSolidity(code: string) {
  const shiki = await getHighlighter()
  const { tokens } = shiki.codeToTokens(code.replace(/\n$/, ""), {
    lang: "solidity",
    theme: "github-dark",
  })

  return tokens.map((line) =>
    line.map((token, index) => (
      <span key={index} style={{ color: token.color } as CSSProperties}>
        {token.content}
      </span>
    ))
  )
}
