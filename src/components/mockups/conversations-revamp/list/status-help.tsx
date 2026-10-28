"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { STATUS_LEGEND } from "@/lib/mockups/conversations-revamp-list-data"
import { StatusBadge } from "@/components/mockups/conversations-revamp/list/status-badges"
import { ColumnHelpIcon } from "@/components/mockups/conversations-revamp/list/icons"

export function StatusHelp() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="What each call status means"
        className="cursor-help text-muted-foreground"
      >
        <ColumnHelpIcon className="size-3.5" />
      </PopoverTrigger>

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
