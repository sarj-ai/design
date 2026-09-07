"use client"

import * as React from "react"

import { HintIcon } from "@/components/design-system/icons"
import { Label } from "@/components/ui/label"
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
 * form is full width and met once, so it explains inline. A drawer is 384px
 * and a dialog step is two columns, and both are read many times and answered
 * once — there a sentence under every label is a paragraph under every label,
 * and the panel stops being a list of settings you can scan.
 *
 * One screen uses one of the two for every field on it. The cost of this one
 * is that a constraint behind a hover is a constraint a reader can set wrong,
 * so a hard limit belongs in the label rather than only in the hint.
 *
 * Shared rather than copied so the boundary is enforced in one place.
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
    <div className={cn("flex items-center gap-2", className)}>
      <Label htmlFor={htmlFor}>{children}</Label>
      <Tooltip>
        {/* size-4 explicitly: the shadcn primitives size icons through their
            own `[&_svg]:size-4`, and TooltipTrigger is not one of them, so
            HugeiconsIcon falls through at its 24px default — beside 14px text
            that reads as a bug. */}
        <TooltipTrigger
          aria-label={`About ${children?.toString().toLowerCase()}`}
          className="text-muted-foreground"
        >
          <HintIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
    </div>
  )
}
