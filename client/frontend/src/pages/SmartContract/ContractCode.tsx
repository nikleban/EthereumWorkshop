import { FileCodeIcon } from "lucide-react"
import { cn } from "cn"
import {
    CodeBlock,
    CodeBlockActions,
    CodeBlockContent,
    CodeBlockCopyButton,
    CodeBlockHeader,
    CodeBlockLine,
    CodeBlockTitle,
} from "@/components/ui/code-block"
import { useHighlightedCode } from "@/hooks/use-highlighted-code"
import { CONTRACT_FILE_NAME, CONTRACT_SOURCE, type LineRange } from "@/pages/SmartContract/contractSource"

type ContractCodeProps = {
    // Lines to mark, from hovering a row in the Read or Write panel
    highlight: LineRange | null
}

export const ContractCode = ({ highlight }: ContractCodeProps) => {
    // Plain text lines until Shiki loads, then highlighted ones
    const lines = useHighlightedCode(CONTRACT_SOURCE)

    return (
        <CodeBlock className="bg-[#111111] border-white/10">
            <CodeBlockHeader className="border-b border-white/10 bg-[#171717] pb-2.5">
                <CodeBlockTitle className="font-mono">
                    <FileCodeIcon />
                    {CONTRACT_FILE_NAME}
                </CodeBlockTitle>
                <span className="text-xs text-[#8A8A8A]">{lines.length} lines</span>
                <CodeBlockActions>
                    <CodeBlockCopyButton value={CONTRACT_SOURCE} />
                </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent lineNumbers>
                {lines.map((line, i) => {
                    const lineNumber = i + 1
                    const isHighlighted = !!highlight && lineNumber >= highlight[0] && lineNumber <= highlight[1]
                    return (
                        <CodeBlockLine
                            key={i}
                            variant={isHighlighted ? "highlighted" : "default"}
                            className={cn(
                                "transition-colors",
                                isHighlighted && "bg-purple-400/10 shadow-[inset_2px_0_0_var(--color-purple-400)]"
                            )}
                        >
                            {line}
                        </CodeBlockLine>
                    )
                })}
            </CodeBlockContent>
        </CodeBlock>
    )
}
