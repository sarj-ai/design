"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CustomRangeIcon } from "@/components/mockups/dashboard/icons"
import {
  PRESET_PERIODS,
  rangeLabel,
  type CustomRange,
  type Period,
} from "@/lib/mockups/dashboard-data"

export function PeriodSelector({
  period,
  range,
  onPeriodChange,
  onRangeApply,
}: {
  period: Period
  range: CustomRange | undefined
  onPeriodChange: (period: Period) => void
  onRangeApply: (range: CustomRange) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<DateRange | undefined>(range)

  return (
    <div className="flex items-center gap-2">
      {PRESET_PERIODS.map((preset) => (
        <Button
          key={preset.id}
          onClick={() => onPeriodChange(preset.id)}
          size="sm"
          variant={period === preset.id ? "default" : "outline"}
        >
          {preset.label}
        </Button>
      ))}

      <Popover
        onOpenChange={(next) => {
          setOpen(next)
          if (next) setDraft(range)
        }}
        open={open}
      >
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant={period === "custom" ? "default" : "outline"}
          >
            <CustomRangeIcon />
            {period === "custom" && range
              ? rangeLabel(range)
              : "Custom range (UTC)"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto">
          <Calendar
            disabled={{ after: new Date(Date.UTC(2026, 9, 20)) }}
            mode="range"
            numberOfMonths={2}
            onSelect={setDraft}
            selected={draft}
          />
          <div className="flex justify-between gap-2 border-t pt-3">
            <Button
              disabled={!draft?.from}
              onClick={() => setDraft(undefined)}
              size="sm"
              variant="outline"
            >
              Clear
            </Button>
            <Button
              disabled={!draft?.from || !draft.to}
              onClick={() => {
                if (!draft?.from || !draft.to) return
                onRangeApply({ from: draft.from, to: draft.to })
                setOpen(false)
              }}
              size="sm"
            >
              Apply range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
