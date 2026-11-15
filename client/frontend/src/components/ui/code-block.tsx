import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "lucide-react"

function CodeBlock({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block"
      className={cn(
        "group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-input text-sm text-foreground has-[>[data-slot=code-block-content]:focus-visible]:border-ring has-[>[data-slot=code-block-content]:focus-visible]:ring-3 has-[>[data-slot=code-block-content]:focus-visible]:ring-ring/50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function CodeBlockHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 px-3 pt-3 text-muted-foreground *:has-[>[data-slot=code-block-title]]:min-w-0",
        className
      )}
      {...props}
    />
  )
}

function CodeBlockTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-title"
      className={cn(
        "min-w-0 truncate font-sans text-sm font-medium text-foreground [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:align-middle [&_svg:not([class*='size-'])]:size-3.5 *:[svg]:me-1.5",
        className
      )}
      {...props}
    />
  )
}

function CodeBlockActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-actions"
      className={cn("-my-1 ms-auto -me-1.5 flex shrink-0 items-center gap-1", className)}
      {...props}
    />
  )
}

function CodeBlockCopyButton({
  value,
  variant = "ghost",
  size = "icon-xs",
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & { value: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        variant={variant}
        size={size}
        aria-label={copied ? "Copied" : "Copy"}
        onClick={(event) => {
          onClick?.(event)
          navigator.clipboard
            .writeText(value)
            .then(() => setCopied(true))
            .catch(() => {})
        }}
        {...props}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </>
  )
}

function CodeBlockContent({
  className,
  children,
  lineNumbers = false,
  ...props
}: React.ComponentProps<"pre"> & { lineNumbers?: boolean }) {
  return (
    <pre
      data-slot="code-block-content"
      data-numbered={lineNumbers || undefined}
      dir="ltr"
      tabIndex={0}
      style={{ counterReset: "line 0" }}
      className={cn(
        "min-h-0 min-w-0 scroll-fade-x scrollbar-thin overflow-auto px-3 py-3 text-start font-mono leading-relaxed outline-none group-has-data-[slot=code-block-header]/code-block:pt-2",
        className
      )}
      {...props}
    >
      <code
        data-slot="code-block-code"
        className="grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr]"
      >
        {children}
      </code>
    </pre>
  )
}

const codeBlockLineVariants = cva(
  "relative -mx-3 block min-h-lh px-3 before:min-w-6 before:text-end before:text-muted-foreground in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']",
  {
    variants: {
      variant: {
        default: "",
        highlighted: "bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function CodeBlockLine({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof codeBlockLineVariants>) {
  // An empty line holds a newline so copying a selection keeps blank lines.
  const empty =
    children === undefined ||
    children === null ||
    children === "" ||
    (Array.isArray(children) && children.length === 0)

  return (
    <span
      data-slot="code-block-line"
      data-variant={variant}
      className={cn(codeBlockLineVariants({ variant }), className)}
      {...props}
    >
      <span data-slot="code-block-line-content" className="min-w-0">
        {empty ? "\n" : children}
      </span>
    </span>
  )
}

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
}
