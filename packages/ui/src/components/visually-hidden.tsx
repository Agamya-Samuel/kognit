import * as React from "react"

const VISUAL_HIDE = {
  position: "absolute" as const,
  width: "1px" as const,
  height: "1px" as const,
  padding: "0" as const,
  margin: "-1px" as const,
  overflow: "hidden" as const,
  clip: "rect(0, 0, 0, 0)" as const,
  whiteSpace: "nowrap" as const,
  borderWidth: "0" as const,
}

const visuallyHidden = {
  visuallyHidden: VISUAL_HIDE
}

export { visuallyHidden }