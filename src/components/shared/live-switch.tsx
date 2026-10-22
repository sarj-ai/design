"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * A scenario's Live switch, in the editor's header: one click, asks nothing
 * (TDD 3.1). DES-203 introduces it and DES-202 keeps it, so both import this
 * one. It was a button opening a popover with the switch inside — two clicks
 * for one value (feedback, 22 Oct 2026). What the popover said moves out:
 *
 *  - Who turned it on or off is the switch's tooltip. Toggling makes no
 *    version, so this is the only record of it.
 *  - What live means for saves is the toast that follows a toggle, said
 *    once at the moment it changes rather than on every visit.
 *
 * The switch sits in an outline control the height of the buttons beside
 * it, so the row reads as one set of controls. The whole control is the
 * label: a click anywhere on it flips the switch.
 */
export function LiveSwitch({
  live,
  canToggle,
  onToggle,
  toggled,
  pending = false,
}: {
  live: boolean
  /** Turning live on or off is its own permission, separate from editing. */
  canToggle: boolean
  onToggle: (on: boolean) => void
  /** Who last turned it on or off, and when. */
  toggled: { by: string; at: string } | null
  /** The change is on its way to the server. */
  pending?: boolean
}) {
  const hint = !canToggle
    ? "You don't have permission to turn this on or off."
    : toggled
      ? `Turned ${live ? "on" : "off"} by ${toggled.by === "You" ? "you" : toggled.by}, ${toggled.at}`
      : null

  const control = (
    <Button
      asChild
      className={canToggle ? "cursor-pointer" : "cursor-not-allowed"}
      variant="outline"
    >
      <Label htmlFor="live-switch">
        {pending ? <Spinner /> : null}
        Live
        <Switch
          checked={live}
          disabled={!canToggle || pending}
          id="live-switch"
          onCheckedChange={onToggle}
          size="sm"
        />
      </Label>
    </Button>
  )

  if (!hint) return control

  return (
    <Tooltip>
      <TooltipTrigger asChild>{control}</TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}
