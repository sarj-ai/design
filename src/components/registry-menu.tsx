"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { INSTALL_COMMANDS, registryUrl } from "@/lib/registry"
import {
  CopiedIcon,
  CopyIcon,
  RegistryIcon,
} from "@/components/workspace-icons"

/**
 * The install command for one mockup, ready to paste into another repo.
 *
 * Every mockup here is published as a shadcn registry item, so taking one is
 * a command rather than a copy-paste of a dozen files. The menu carries all
 * four package managers because the repo it lands in is not this one, and the
 * raw URL underneath for anything that wants the JSON directly.
 */
export function RegistryMenu({ slug, title }: { slug: string; title: string }) {
  /* Which row was last copied, so the tick lands on that row rather than on
     the whole menu. Cleared on a timer — the menu usually closes first, but it
     stays open if the reader is copying a second variant. */
  const [copied, setCopied] = React.useState<string>("")
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const url = registryUrl(slug)

  async function copy(id: string, value: string, description: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(id)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(""), 2000)
      toast.success(`${description} copied`, { description: title })
    } catch {
      /* Clipboard is permission-gated and fails on an insecure origin, so the
         reader still needs a way to get the text. */
      toast.error("Could not reach the clipboard", { description: value })
    }
  }

  return (
    <DropdownMenu>
      {/* Ghost, not outline: the card already carries an outlined Open mockup
          and outlined ticket chips, and this is the occasional action of the
          three. What it was missing is not weight but a name — nothing said
          what `</>` did until you clicked it. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`Install commands for ${title}`}
              size="icon-sm"
              variant="ghost"
            >
              <RegistryIcon />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Add to another repo</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Add to another repo</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {INSTALL_COMMANDS.map((manager) => (
          <DropdownMenuItem
            key={manager.id}
            onSelect={(event) => {
              /* Keep the menu open: copying one command is often followed by
                 copying the URL, and a menu that shuts on every click makes
                 the second one a second trip. */
              event.preventDefault()
              copy(manager.id, manager.command(url), `${manager.label} command`)
            }}
          >
            <span className="me-auto">{manager.label}</span>
            {copied === manager.id ? <CopiedIcon /> : <CopyIcon />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            copy("url", url, "Registry URL")
          }}
        >
          <span className="me-auto">Registry URL</span>
          {copied === "url" ? <CopiedIcon /> : <CopyIcon />}
        </DropdownMenuItem>

        <p className="px-1.5 py-1 text-xs text-muted-foreground">
          Installs the screen, its mock data and every shadcn primitive it uses
          into your own components folder.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
