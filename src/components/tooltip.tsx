import { Tooltip } from "react-tooltip"
import { tooltipStyle } from "@/lib/tootlipStyle"

export function GlobalTooltip() {
  return (
    <Tooltip
      id="copy-tooltip"
      style={tooltipStyle}
    />
  )
}
