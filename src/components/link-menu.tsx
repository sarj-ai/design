"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { linearIssueUrl } from "@/lib/linear"
import { mockupUrl } from "@/lib/registry"
import {
  CopiedIcon,
  CopyIcon,
  ShareLinkIcon,
} from "@/components/workspace-icons"

/**
 * Every link this card has, in one place, ready to paste.
 *
 * The two links a reviewer needs are the two they cannot get at: the mockup's
 * published URL — which is not in the address bar, because the index is — and
 * the tickets it answers. Both get pasted into Linear and Slack constantly,
 * and the alternative is opening the page to copy the address, or opening the
 * ticket to copy its address.
 *
 * Ticket chips on the card carry the same links and OPEN them. This menu is
 * the other half of the same job: one is for going there, one is for handing
 * it to someone else.
 */
export function LinkMenu({
  slug,
  tickets,
  title,
}: {
  slug: string
  tickets: string[]
  title: string
}) {
  /* Which row was last copied, so the tick lands on that row rather than on
     the whole menu. Cleared on a timer. */
  const [copied, setCopied] = React.useState<string>("")
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  React.useEffect(() => () => clearTimeout(timer.current), [])

  async function copy(id: string, value: string, description: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(id)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(""), 2000)
      toast.success(`${description} copied`, { description: value })
    } catch {
      /* Clipboard is permission-gated and fails on an insecure origin, so the
         reader still needs a way to get the text. */
      toast.error("Could not reach the clipboard", { description: value })
    }
  }

  const rows = [
    { id: "mockup", label: "Mockup link", value: mockupUrl(slug) },
    ...tickets.map((ticket) => ({
      id: ticket,
      label: ticket,
      value: linearIssueUrl(ticket),
    })),
  ]

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`Copy links for ${title}`}
              size="icon-sm"
              variant="ghost"
            >
              <ShareLinkIcon />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Copy links</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Copy links</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {rows.map((row, index) => (
          <React.Fragment key={row.id}>
            {/* The mockup is the thing; the tickets are what it answers. A
                rule between them so a reviewer reaching for one does not have
                to read the other. */}
            {index === 1 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              onSelect={(event) => {
                /* Kept open: copying the mockup link and then a ticket is one
                   errand, and a menu that shuts on every click makes it two. */
                event.preventDefault()
                copy(row.id, row.value, row.label)
              }}
            >
              <span className="me-auto">{row.label}</span>
              {copied === row.id ? <CopiedIcon /> : <CopyIcon />}
            </DropdownMenuItem>
          </React.Fragment>
        ))}

        {tickets.length ? null : (
          <p className="px-1.5 py-1 text-xs text-muted-foreground">
            No ticket is listed for this mockup yet.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
