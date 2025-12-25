import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CopyButton } from "@/components/copy-button"
import { useEffect, useState, useRef, memo } from "react"
import { useThemeStore } from "@/lib/theme-store"

interface MarkdownRendererProps {
  content: string
}

const CodeBlock = memo(function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [highlightedCode, setHighlightedCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const codeRef = useRef<HTMLDivElement>(null)
  const {theme} = useThemeStore()
  useEffect(() => {
    let cancelled = false

    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki")
        const html = await codeToHtml(code, {
          lang: language || "text",
          theme: theme === 'dark' ? 'catppuccin-mocha' : 'light-plus',
        })
        if (!cancelled) {
          setHighlightedCode(html)
          setIsLoading(false)
        }
      } catch {
        // Fallback to plain text if language not supported
        if (!cancelled) {
          setHighlightedCode("")
          setIsLoading(false)
        }
      }
    }

    highlight()
    return () => {
      cancelled = true
    }
  }, [code, language])

  return (
    <div className="group/code relative my-4 overflow-hidden rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 dark:bg-[#0d1117] bg-[#f6f8fa] shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/30 dark:border-zinc-800/30 dark:bg-[#161b22] bg-[#d1d1d1] px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          {language && <span className="ml-3 text-xs font-medium text-zinc-500/70 dark:text-zinc-400/70">{language}</span>}
        </div>
        <div className="opacity-0 transition-opacity group-hover/code:opacity-100">
          <CopyButton text={code} />
        </div>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto p-4">
        {isLoading ? (
          <pre className="font-mono text-sm text-[#c9d1d9]">
            <code>{code}</code>
          </pre>
        ) : highlightedCode ? (
          <div
            ref={codeRef}
            className="shiki-wrapper text-sm [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          <pre className="font-mono text-sm text-[#c9d1d9]">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
})

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          const codeString = String(children).replace(/\n$/, "")
          const isInline = !match && !codeString.includes("\n")

          if (isInline) {
            return (
              <code className="rounded-md bg-zinc-100/80 dark:bg-zinc-800/80 px-1.5 py-0.5 font-mono text-sm text-zinc-900 dark:text-zinc-100" {...props}>
                {children}
              </code>
            )
          }

          return <CodeBlock code={codeString} language={match?.[1]} />
        },
        p({ children }) {
          return <p className="mb-4 leading-7 last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>
        },
        ol({ children }) {
          return <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>
        },
        li({ children }) {
          return <li className="leading-7">{children}</li>
        },
        h1({ children }) {
          return <h1 className="mb-4 mt-8 text-2xl font-bold tracking-tight first:mt-0">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="mb-3 mt-6 text-xl font-semibold tracking-tight first:mt-0">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="mb-2 mt-5 text-lg font-semibold first:mt-0">{children}</h3>
        },
        blockquote({ children }) {
          return (
            <blockquote className="my-4 border-l-4 border-primary/50 bg-muted/30 py-2 pl-4 italic">
              {children}
            </blockquote>
          )
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          )
        },
        table({ children }) {
          return (
            <div className="my-4 overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border">{children}</table>
            </div>
          )
        },
        th({ children }) {
          return <th className="bg-muted/50 px-4 py-3 text-left text-sm font-semibold">{children}</th>
        },
        td({ children }) {
          return <td className="px-4 py-3 text-sm">{children}</td>
        },
        hr() {
          return <hr className="my-6 border-border" />
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>
        },
        em({ children }) {
          return <em className="italic">{children}</em>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
