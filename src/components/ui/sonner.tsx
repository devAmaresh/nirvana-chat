import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg backdrop-blur-xl",
          title: "text-zinc-900 dark:text-zinc-100",
          description: "text-zinc-600 dark:text-zinc-400",
          actionButton: "bg-emerald-500 text-white",
          cancelButton: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
