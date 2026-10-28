"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LANGUAGE_NAMES } from "@/lib/design-system/data"

/** Must not wrap: a second line grows the row past the table's fixed 40px. */
export function LanguageChip({ languages }: { languages: string[] }) {
  return (
    <span className="flex flex-nowrap items-center gap-1 whitespace-nowrap">
      {languages.map((code) => (
        <Tooltip key={code}>
          <TooltipTrigger asChild>
            <Badge
              className="bg-muted text-muted-foreground"
              variant="secondary"
            >
              <span aria-label={LANGUAGE_NAMES[code]}>{code}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{LANGUAGE_NAMES[code]}</TooltipContent>
        </Tooltip>
      ))}
    </span>
  )
}

export function NotApplicable() {
  return <span className="text-muted-foreground">—</span>
}
