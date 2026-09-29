"use client"

import * as React from "react"

import { HintIcon } from "@/components/design-system/icons"
import { FieldLabel } from "@/components/ui/field"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * A label and the (i) that explains it, on one line.
 *
 * What decides between this and an inline `FieldDescription` is the surface. A
 * form or a page is met once, so it explains inline. A drawer or a dialog is a
 * settings panel read many times and answered once — there a sentence under
 * every label is a paragraph under every label, and the panel stops being a
 * list you can scan. Vansh's call, 29 September 2026, over the drawer demo.
 *
 * Only on a field that needs it: a label that already says everything gets
 * no (i). And a hard limit never hides here — a reader sets it wrong behind a
 * hover — so it stays on screen as a reading beside the label ("~6s of 20s").
 *
 * The icon is sized to the label, not to the icon scale: 14px beside 14px
 * text, muted until it is pointed at, so the row reads as a label first. It is
 * a real button, so the hint opens on keyboard focus as well as on hover.
 */
export function FieldHint({
  children,
  className,
  hint,
  htmlFor,
}: {
  children: React.ReactNode
  /** Placement only. A horizontal `Field` grows the child carrying the
      field-label slot, and this wrapper is a div around one, so the row needs
      to be told to give it the space. */
  className?: string
  hint: string
  htmlFor: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {/* FieldLabel, not Label: the same line height as an unhinted
          label, so a hinted field lines up with its neighbours in a row. */}
      <FieldLabel htmlFor={htmlFor}>{children}</FieldLabel>
      <Tooltip>
        {/* Opens from the icon toward the panel's inside edge rather than
            centred on it, so it never hangs off a drawer's start edge.
            The size is set here because TooltipTrigger does not size its
            icon the way the shadcn primitives do, and HugeIcons falls through
            to 24px. */}
        <TooltipTrigger
          aria-label={`About ${children?.toString().toLowerCase()}`}
          className="rounded-full text-muted-foreground/70 transition-colors duration-150 ease-out-cubic outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
          type="button"
        >
          <HintIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent
          align="start"
          className="text-balance"
          side="top"
          sideOffset={4}
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
