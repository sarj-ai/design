"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CopiedIcon, CopyIcon } from "@/components/shell/workspace-icons"

export function CopySkillButton({
  content,
  path,
}: {
  content: string
  path: string
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  React.useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
      toast.success("Reel skill copied", { description: path })
    } catch {
      toast.error("Could not reach the clipboard", { description: path })
    }
  }

  return (
    <Button onClick={copy} size="sm" variant="ghost">
      {copied ? <CopiedIcon /> : <CopyIcon />}
      Copy skill file
    </Button>
  )
}
