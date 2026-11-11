"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";

import { CustomRangeIcon } from "@/components/mockups/scenario-dashboard/icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GRANULARITIES,
  PRESET_PERIODS,
  TODAY,
  VERSIONS,
  granularityFits,
  rangeLabel,
  type CustomRange,
  type Granularity,
  type Period,
  type VersionFilter,
} from "@/lib/mockups/scenario-dashboard-data";

export function DashboardFilters({
  days,
  granularity,
  onGranularityChange,
  onPeriodChange,
  onRangeApply,
  onVersionChange,
  period,
  range,
  version,
}: {
  days: number;
  granularity: Granularity;
  onGranularityChange: (next: Granularity) => void;
  onPeriodChange: (next: Period) => void;
  onRangeApply: (next: CustomRange) => void;
  onVersionChange: (next: VersionFilter) => void;
  period: Period;
  range: CustomRange | undefined;
  version: VersionFilter;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        onValueChange={(next) => {
          const match = VERSIONS.find((entry) => entry.id === next);
          if (match) onVersionChange(match.id);
        }}
        value={version}
      >
        <SelectTrigger aria-label="Version" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {VERSIONS.map((entry) => (
            <SelectItem key={entry.id} value={entry.id}>
              {entry.label}
              {entry.live ? (
                <span className="text-muted-foreground">Live</span>
              ) : null}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <PeriodSelector
        onPeriodChange={onPeriodChange}
        onRangeApply={onRangeApply}
        period={period}
        range={range}
      />

      <Select
        onValueChange={(next) => {
          const match = GRANULARITIES.find((entry) => entry.id === next);
          if (match) onGranularityChange(match.id);
        }}
        value={granularity}
      >
        <SelectTrigger aria-label="Granularity" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {GRANULARITIES.map((entry) => (
            <SelectItem
              disabled={!granularityFits(entry.id, days)}
              key={entry.id}
              value={entry.id}
            >
              {entry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PeriodSelector({
  period,
  range,
  onPeriodChange,
  onRangeApply,
}: {
  period: Period;
  range: CustomRange | undefined;
  onPeriodChange: (period: Period) => void;
  onRangeApply: (range: CustomRange) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange | undefined>(range);

  return (
    <div className="flex flex-wrap items-center gap-2">
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
          setOpen(next);
          if (next) setDraft(range);
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
        <PopoverContent align="start" className="w-auto">
          <Calendar
            defaultMonth={new Date(Date.UTC(2026, 9, 1))}
            disabled={{ after: TODAY }}
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
                if (!draft?.from || !draft.to) return;
                onRangeApply({ from: draft.from, to: draft.to });
                setOpen(false);
              }}
              size="sm"
            >
              Apply range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
