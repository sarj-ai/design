"use client"

import * as React from "react"
import { Cancel01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { icon } from "@/components/shared/icon"

const AddIcon = icon(PlusSignIcon, "AddIcon")
const ClearIcon = icon(Cancel01Icon, "ClearIcon")

export type { DateRange }
export type FilterOption = { value: string; label: string }

/**
 * Filters as a row of chips under the search.
 *
 * A filter that is not set is one small chip naming its field — "+ Language" —
 * so ten of them cost a line, not a toolbar. Opening one gives its control the
 * room it needs (a checklist, a calendar) in a popover. Once set, the chip
 * reads its value and grows an × to clear it. Past two set filters the row
 * ends in Clear all.
 *
 * Show the three or four filters people reach for as chips; put the rest
 * behind AddFilter, which turns a chosen field into a chip of its own.
 */
export function FilterBar({
  children,
  activeCount = 0,
  onClearAll,
}: {
  children: React.ReactNode
  /** How many filters are set. Clear all appears at two. */
  activeCount?: number
  onClearAll?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      {activeCount >= 2 ? (
        <Button variant="ghost" size="xs" onClick={onClearAll}>
          Clear all
        </Button>
      ) : null}
    </div>
  )
}

/**
 * The chip itself: "+ Field" when empty, "Field: value" and an × once set.
 * `children` is the trigger's popover or menu content.
 */
function Chip({
  field,
  summary,
  onClear,
  trigger,
}: {
  field: string
  /** What the filter is set to, or null when it is not set. */
  summary: string | null
  onClear: () => void
  trigger: (button: React.ReactElement) => React.ReactNode
}) {
  if (!summary) {
    return trigger(
      <Button variant="outline" size="xs">
        <AddIcon />
        {field}
      </Button>,
    )
  }

  return (
    <ButtonGroup>
      {trigger(
        <Button variant="outline" size="xs">
          {field}: <span className="font-semibold">{summary}</span>
        </Button>,
      )}
      <Button
        variant="outline"
        size="icon-xs"
        aria-label={`Clear ${field}`}
        onClick={onClear}
      >
        <ClearIcon />
      </Button>
    </ButtonGroup>
  )
}

/** Pick one or more values. More than one reads as a count. */
export function SelectFilter({
  field,
  options,
  value,
  onChange,
}: {
  field: string
  options: FilterOption[]
  value: string[]
  onChange: (value: string[]) => void
}) {
  const summary =
    value.length === 0
      ? null
      : value.length === 1
        ? (options.find((option) => option.value === value[0])?.label ??
          value[0])
        : String(value.length)

  return (
    <Chip
      field={field}
      summary={summary}
      onClear={() => onChange([])}
      trigger={(button) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={value.includes(option.value)}
                /* Stays open, so several values can be ticked in one go. */
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={(checked) =>
                  onChange(
                    checked
                      ? [...value, option.value]
                      : value.filter((item) => item !== option.value),
                  )
                }
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  )
}

const DAY = 24 * 60 * 60 * 1000

/** A date range: presets first, then any range on the calendar. */
export function DateFilter({
  field,
  value,
  onChange,
  today,
}: {
  field: string
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
  /** What "today" is. Mock data is dated, so the demo fixes it. */
  today: Date
}) {
  const presets = [
    { label: "Today", from: today },
    { label: "Last 7 days", from: new Date(today.getTime() - 6 * DAY) },
    { label: "Last 30 days", from: new Date(today.getTime() - 29 * DAY) },
  ]

  const preset = presets.find(
    (entry) =>
      value?.from?.toDateString() === entry.from.toDateString() &&
      value?.to?.toDateString() === today.toDateString(),
  )

  const summary = !value?.from
    ? null
    : (preset?.label ??
      [value.from, value.to]
        .filter(Boolean)
        .map((date) =>
          date!.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        )
        .join(" – "))

  return (
    <Chip
      field={field}
      summary={summary}
      onClear={() => onChange(undefined)}
      trigger={(button) => (
        <Popover>
          <PopoverTrigger asChild>{button}</PopoverTrigger>
          <PopoverContent align="start" className="w-auto">
            <div className="flex gap-2">
              <div className="flex flex-col gap-1">
                {presets.map((entry) => (
                  <Button
                    key={entry.label}
                    variant={preset === entry ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start"
                    onClick={() => onChange({ from: entry.from, to: today })}
                  >
                    {entry.label}
                  </Button>
                ))}
              </div>
              <Separator orientation="vertical" />
              <Calendar
                mode="range"
                selected={value}
                onSelect={onChange}
                defaultMonth={value?.from ?? today}
                disabled={{ after: today }}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}
    />
  )
}

/** The filters not shown as chips. Choosing one adds its chip to the row. */
export function AddFilter({
  fields,
  onAdd,
}: {
  fields: { id: string; label: string }[]
  onAdd: (id: string) => void
}) {
  if (!fields.length) return null

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="xs">
          <AddIcon />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {fields.map((field) => (
          <DropdownMenuItem key={field.id} onSelect={() => onAdd(field.id)}>
            {field.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
