"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import { CopiedIcon, CopyLinkIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"

/**
 * Copies the address of the topic currently open.
 *
 * The page it sits on exists to be quoted at someone — "the drawer rule is
 * here" — and the address bar of a docs site holds a URL long enough that
 * selecting it by hand is a small chore. One press instead.
 *
 * It reads the location at press time rather than on render because the shell
 * stays mounted across navigations, so a value captured earlier would copy the
 * previous topic's link.
 */
export function CopyLinkButton() {
  const pathname = usePathname()
  const [copied, setCopied] = React.useState(false)

  /* Back to the neutral label on its own, so the control does not sit there
     claiming a copy that happened a minute ago. Cleared on unmount and on a
     second press, which is what stops two timers racing to reset it. */
  React.useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copy() {
    const url = new URL(pathname, window.location.origin).toString()

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      /* Clipboard access is refused outright in some browsers rather than
         failing quietly, and a button that looks like it worked when it did
         not is worse than one that says so. */
      toast.error("Could not copy the link", { description: url })
    }
  }

  return (
    <Button onClick={copy} size="sm" variant="outline">
      {copied ? <CopiedIcon /> : <CopyLinkIcon />}
      {copied ? "Copied" : "Copy link"}
    </Button>
  )
}
