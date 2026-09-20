"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CopiedIcon, CopyIcon } from "@/components/shell/workspace-icons"

/**
 * The reel skill, onto the clipboard.
 *
 * `.claude/skills/sarj-reel/SKILL.md` is how an agent learns to build one of
 * these — the one rule, the animation kernel, framing a screenshot, the
 * scripted cursor. Until now the only way to use it anywhere else was to know
 * the path and open the file, which nobody who has not worked in this repo
 * does. This hands over the whole file verbatim, frontmatter included, so it
 * drops straight into another repo's `.claude/skills/` or into a chat.
 *
 * Ghost rather than outline: the navigation beside it is what this page is
 * for, and this is the thing you take once.
 */
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
      /* The clipboard is permission-gated and unavailable on an insecure
         origin. Every other copy here falls back to putting the text in the
         toast; a skill file is thousands of words, so the fallback is where
         to find it instead. */
      toast.error("Could not reach the clipboard", { description: path })
    }
  }

  /* The label holds still and only the icon changes — a label that swaps to
     "Copied" resizes the button under the pointer that just pressed it. */
  return (
    <Button onClick={copy} size="sm" variant="ghost">
      {copied ? <CopiedIcon /> : <CopyIcon />}
      Copy skill file
    </Button>
  )
}
