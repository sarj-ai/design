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
