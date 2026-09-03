"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { STATUS_LEGEND } from "@/lib/conversations-revamp-list-data"
import { StatusBadge } from "@/components/conversations-revamp/list/status-badges"
import { ColumnHelpIcon } from "@/components/conversations-revamp/list/icons"

/**
 * What the Call status column means, as a legend.
 *
 * It was a tooltip: five definitions run together into one paragraph on the
 * tooltip's black surface. Three things were wrong with that, and they compound
 * on the one column that most needs explaining.
 *
 * A tooltip is for a hint you read in passing — a word, a date, a full label
 * for something truncated. This is reference: the reader came to it with a
 * question and wants to look something up. Reference needs rows, not a
 * sentence, and it needs to stay open while they look between it and the
 * table, which a tooltip will not do.
 *
 * The black is the tooltip primitive's own `bg-foreground`, and it is right for
 * a line of text — inverted, brief, clearly not part of the page. At paragraph
 * length it is a wall of reversed type. A popover is `bg-popover`, the same
 * surface as everything else the reader is reading.
 *
 * And the definitions described colours in words that the column shows in
 * colour. Each row now carries the real chip, so matching one to the other is
 * looking rather than translating.
 */
export function StatusHelp() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="What each call status means"
        className="cursor-help text-muted-foreground"
      >
        <ColumnHelpIcon className="size-3.5" />
      </PopoverTrigger>

      {/* End-aligned, which pulls most of it off the column it was opened
          from. It still clips the column's first rows, and that is the trade:
          every row here carries the real chip, so the comparison the reader
          came for is inside the legend rather than between it and the table. */}
      <PopoverContent align="end" className="w-80 gap-3">
        <p className="text-xs font-medium text-muted-foreground">Call status</p>

        <div className="flex flex-col gap-2.5">
          {STATUS_LEGEND.map(({ detail, status }) => (
            <div className="flex flex-col gap-1" key={status}>
              <StatusBadge status={status} />
              <p className="text-xs font-normal text-muted-foreground">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
