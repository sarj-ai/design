"use client"

import * as React from "react"

import { HintIcon } from "@/components/design-system/icons"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * A label and the (i) that explains it, on one line.
 *
 * The repo's default is an inline `FieldDescription` under the label, and it
 * is the better call on a full-width form. These two surfaces are not that: a
 * dialog step is two columns and a side drawer is about 384px, so a sentence
 * under every label wraps to two lines and the controls end up below a wall of
 * prose. The (i) keeps the field list scannable and puts the sentence one
 * hover away.
 *
 * Shared rather than copied, because the rule both screens are keeping is that
 * a screen uses one explanation language throughout — which is only checkable
 * if there is one thing to check.
 */
export function FieldHint({
  children,
  hint,
  htmlFor,
}: {
  children: React.ReactNode
  hint: string
  htmlFor: string
}) {
  return (
    <div className="flex items-center gap-2">
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
