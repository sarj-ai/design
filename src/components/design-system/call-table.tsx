"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LANGUAGE_NAMES,
} from "@/lib/design-system/data"

/**
 * One chip per language: the two-letter code, with the full name in a tooltip.
 *
 * Taken from `LanguageChip` in the app (`app/src/components/language-chip.tsx`)
 * rather than reinvented. Neutral because a language is a category and not a
 * state, and the code rather than the name because spelling each one out costs
 * a column of width for a value the reader recognises at a glance — a row can
 * carry three at once. The name is what assistive tech reads, so the chip is
 * never just two unexplained letters.
 */
/**
 * The codes stay on one line. Wrapping put a second language under the first
 * and grew that row past the table's fixed 40px, so a row with two languages
 * was taller than a row with one — and once row heights vary, the eye reads
 * the ragged left edge of the next column instead of the data. Two or three
 * two-letter codes cost less width than the header word above them.
 */
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

/**
 * A number that does not exist yet. An em dash rather than 0 or a blank: zero
 * is a measurement, and a blank cell reads as a rendering fault.
 */
export function NotApplicable() {
  return <span className="text-muted-foreground">—</span>
}
