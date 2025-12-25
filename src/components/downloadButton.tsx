import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FaMarkdown } from "react-icons/fa6";
import { TbFileTypeDocx } from "react-icons/tb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { convertMarkdownToDocx, downloadDocx } from "@mohtasham/md-to-docx"

interface DownloadButtonProps {
  content: string
}

export function DownloadButton({ content }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadMarkdown = () => {
    try {
      const blob = new Blob([content], { type: "text/markdown" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `chat-message-${Date.now()}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download markdown:", error)
    }
  }

  const handleDownloadDocx = async () => {
    setIsDownloading(true)
    try {
      // Ensure proper markdown formatting with bold syntax
      const formattedContent = content
      const blob = await convertMarkdownToDocx(formattedContent)
      downloadDocx(blob, `chat-message-${Date.now()}.docx`)
    } catch (error) {
      console.error("Failed to download docx:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          disabled={isDownloading}
          className="h-8 gap-1 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-zinc-500 dark:text-zinc-400"
        >
          <Download className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-5 bg-white dark:bg-zinc-900 border-emerald-500/30 dark:border-emerald-500/40"
      >
        <DropdownMenuItem
          onClick={handleDownloadMarkdown}
          className="cursor-pointer hover:bg-emerald-500/10 focus:bg-emerald-500/10 text-zinc-700 dark:text-zinc-300"
        >
          <FaMarkdown className="h-4 w-4" />
          <span className="text-sm">Markdown</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDownloadDocx}
          disabled={isDownloading}
          className="cursor-pointer hover:bg-emerald-500/10 focus:bg-emerald-500/10 text-zinc-700 dark:text-zinc-300"
        >
          <TbFileTypeDocx className="mr-2 h-4 w-4" />
          <span className="text-sm">{isDownloading ? "Converting..." : "DOCX"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
