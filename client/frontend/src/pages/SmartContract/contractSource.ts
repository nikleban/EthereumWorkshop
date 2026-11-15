import source from "@contracts/CommunityCounter.sol?raw"

export const CONTRACT_SOURCE = source
export const CONTRACT_FILE_NAME = "CommunityCounter.sol"

export type LineRange = [start: number, end: number]

// e.g. "^0.8.34" from "pragma solidity ^0.8.34;"
export const SOLIDITY_VERSION = source.match(/pragma solidity ([^;]+);/)?.[1] ?? null

// Maps each state variable and function name to its lines (1-based), so hovering a row can highlight it
const findRanges = (code: string) => {
  const lines = code.split("\n")
  const ranges: Record<string, LineRange> = {}

  lines.forEach((line, i) => {
    // "uint public counter = 0;" or "mapping(...) public userIsInCommunity;"
    const variable = line.match(/\bpublic\s+(\w+)\s*[=;]/)
    if (variable) ranges[variable[1]] = [i + 1, i + 1]

    // A function runs until its braces balance again
    const fn = line.match(/^\s*function\s+(\w+)/)
    if (fn) {
      let depth = 0
      let end = i
      for (; end < lines.length; end++) {
        depth += (lines[end].match(/{/g)?.length ?? 0) - (lines[end].match(/}/g)?.length ?? 0)
        if (depth === 0 && lines[end].includes("}")) break
      }
      ranges[fn[1]] = [i + 1, end + 1]
    }
  })

  return ranges
}

export const CONTRACT_RANGES = findRanges(source)

export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`
