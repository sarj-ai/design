"use client"

import * as React from "react"
import { toast } from "sonner"

export function useCopy() {
  const [copied, setCopied] = React.useState("")
  const timer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy(id: string, value: string, what: string, detail: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(id)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(""), 2000)
      toast.success(`${what} copied`, { description: detail })
    } catch {
      /* Clipboard is permission-gated and fails on an insecure origin, so the
         reader still needs a way to get the text. */
      toast.error("Could not reach the clipboard", { description: value })
    }
  }

  return { copied, copy }
}
