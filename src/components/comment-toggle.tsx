"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  setToolbar,
  useToolbarEnabled,
  useToolbarSuppressed,
} from "@/components/staff-toolbar"
import { CommentIcon } from "@/components/workspace-icons"

/**
 * Turns Vercel Comments on for the mockup under it.
 *
 * The toolbar is opt-in — mounting it for everyone prompts *every* visitor to
 * log in to Vercel — but the opt-in used to be a query param you had to know
 * about, so a link sent without it was a dead end. This is that same switch
 * with an address: last in the shell header, identical on every mockup.
 *
 * It stays visible once the toolbar is up. The header is reviewer chrome
 * rather than part of the design being reviewed, and leaving it there is what
 * makes turning commenting back off something other than a typed URL.
 */
export function CommentToggle() {
  const enabled = useToolbarEnabled()
  const suppressed = useToolbarSuppressed()

  if (suppressed) return null

  /* The divider belongs to the toggle rather than to the header, so that
     hiding one for a screenshot cannot leave the other stranded. */
  return (
    <>
      <Separator
        orientation="vertical"
        className="h-5 data-vertical:self-center"
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={
              enabled ? "Turn commenting off" : "Comment on this mockup"
            }
            aria-pressed={enabled}
            className={enabled ? undefined : "text-muted-foreground"}
            onClick={() => setToolbar(!enabled)}
            size="icon-sm"
            variant="ghost"
          >
            <CommentIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {enabled ? "Turn commenting off" : "Comment on this mockup"}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
