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

export function FieldHint({
  children,
  className,
  hint,
  htmlFor,
}: {
  children: React.ReactNode
  /** Placement only: a horizontal `Field` needs to be told to grow this wrapper. */
  className?: string
  hint: string
  htmlFor: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {/* FieldLabel, not Label, so a hinted field keeps the same line height as its neighbours. */}
      <FieldLabel htmlFor={htmlFor}>{children}</FieldLabel>
      <Tooltip>
        {/* Sized here because TooltipTrigger does not size its icon, and HugeIcons falls through to 24px. */}
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
