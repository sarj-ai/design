"use client"

import * as React from "react"
import { Cancel01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
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
export type Range = { min?: number; max?: number }

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
 * One tree for both states: swapping the button for a group once a value is
 * set would remount the trigger, and the open list would close on the first
 * tick.
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
  return (
    <ButtonGroup>
      {trigger(
        <Button variant="outline" size="xs">
          {summary ? (
            <>
              {field}: <span className="font-semibold">{summary}</span>
            </>
          ) : (
            <>
              <AddIcon />
              {field}
            </>
          )}
        </Button>,
      )}
      {summary ? (
        <Button
          variant="outline"
          size="icon-xs"
          aria-label={`Clear ${field}`}
          onClick={onClear}
        >
          <ClearIcon />
        </Button>
      ) : null}
    </ButtonGroup>
  )
}

/* ---------------------------------------------------------------- summaries */

/**
 * What a many-value filter reads once set: the value, two values when both
 * fit, and past that the first value and how many more — "Completed +2".
 * A bare count ("Status: 3") makes you open the chip to learn anything.
 */
function manySummary(options: FilterOption[], value: string[]) {
  if (!value.length) return null
  const labels = value.map(
    (item) => options.find((option) => option.value === item)?.label ?? item,
  )
  if (labels.length === 1) return labels[0]
  if (labels.length === 2 && labels.join(", ").length <= 24)
    return labels.join(", ")
  return `${labels[0]} +${labels.length - 1}`
}

const DAY = 24 * 60 * 60 * 1000

function datePresets(today: Date) {
  return [
    { label: "Today", from: today },
    { label: "Last 7 days", from: new Date(today.getTime() - 6 * DAY) },
    { label: "Last 30 days", from: new Date(today.getTime() - 29 * DAY) },
  ]
}

function dateSummary(value: DateRange | undefined, today: Date) {
  if (!value?.from) return null
  const preset = datePresets(today).find(
    (entry) =>
      value.from?.toDateString() === entry.from.toDateString() &&
      value.to?.toDateString() === today.toDateString(),
  )
  return (
    preset?.label ??
    [value.from, value.to]
      .filter(Boolean)
      .map((date) =>
        date!.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      )
      .join(" – ")
  )
}

function rangeSummary(range: Range | null, unit: string) {
  if (!range) return null
  const { min, max } = range
  if (min !== undefined && max !== undefined) return `${min}–${max} ${unit}`
  if (min !== undefined) return `Over ${min} ${unit}`
  if (max !== undefined) return `Under ${max} ${unit}`
  return null
}

/** Past this many options the list gets a search box. */
const SEARCH_FROM = 8

/**
 * The one list every select filter opens, many-value or one-value, so the two
 * cannot drift apart: same popover, same width, same rows, the tick on the
 * right. A long list searches; a set many-value list ends in Clear.
 */
function OptionList({
  button,
  field,
  options,
  selected,
  onSelect,
  onClear,
  closeOnSelect,
}: {
  button: React.ReactElement
  field: string
  options: FilterOption[]
  selected: string[]
  onSelect: (value: string) => void
  onClear?: () => void
  /** One-value filters close on a pick; many-value ones stay open. */
  closeOnSelect: boolean
}) {
  const [open, setOpen] = React.useState(false)
  /* Ticked ones float to the top of a long list, so they are never scrolled
     out of sight — but only when it opens, not under the pointer. */
  const [order, setOrder] = React.useState(options)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next && options.length >= SEARCH_FROM)
          setOrder([
            ...options.filter((o) => selected.includes(o.value)),
            ...options.filter((o) => !selected.includes(o.value)),
          ])
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>{button}</PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          {options.length >= SEARCH_FROM ? (
            <CommandInput placeholder={`Search ${field.toLowerCase()}`} />
          ) : null}
          <CommandList>
            <CommandEmpty>No match</CommandEmpty>
            <CommandGroup>
              {(options.length >= SEARCH_FROM ? order : options).map(
                (option) => (
                  <CommandItem
                    className="truncate"
                    data-checked={selected.includes(option.value)}
                    key={option.value}
                    onSelect={() => {
                      onSelect(option.value)
                      if (closeOnSelect) setOpen(false)
                    }}
                    value={option.label}
                  >
                    {option.label}
                  </CommandItem>
                ),
              )}
            </CommandGroup>
          </CommandList>
          {onClear && selected.length ? (
            <div className="border-t p-1">
              <Button
                className="w-full"
                onClick={onClear}
                size="sm"
                variant="ghost"
              >
                Clear
              </Button>
            </div>
          ) : null}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/** Pick one or more values. The list stays open while ticking. */
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
  return (
    <Chip
      field={field}
      summary={manySummary(options, value)}
      onClear={() => onChange([])}
      trigger={(button) => (
        <OptionList
          button={button}
          closeOnSelect={false}
          field={field}
          onClear={() => onChange([])}
          onSelect={(item) =>
            onChange(
              value.includes(item)
                ? value.filter((entry) => entry !== item)
                : [...value, item],
            )
          }
          options={options}
          selected={value}
        />
      )}
    />
  )
}

/** Pick exactly one value — a direction, a channel. Choosing closes it. */
export function ChoiceFilter({
  field,
  options,
  value,
  onChange,
}: {
  field: string
  options: FilterOption[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  return (
    <Chip
      field={field}
      summary={options.find((option) => option.value === value)?.label ?? null}
      onClear={() => onChange(null)}
      trigger={(button) => (
        <OptionList
          button={button}
          closeOnSelect
          field={field}
          onSelect={(item) => onChange(item === value ? null : item)}
          options={options}
          selected={value ? [value] : []}
        />
      )}
    />
  )
}

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
  return (
    <Chip
      field={field}
      summary={dateSummary(value, today)}
      onClear={() => onChange(undefined)}
      trigger={(button) => (
        <Popover>
          <PopoverTrigger asChild>{button}</PopoverTrigger>
          <PopoverContent align="start" className="w-auto">
            <div className="flex gap-2">
              <div className="flex flex-col gap-1">
                {datePresets(today).map((entry) => (
                  <Button
                    key={entry.label}
                    variant={
                      dateSummary(value, today) === entry.label
                        ? "secondary"
                        : "ghost"
                    }
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

/**
 * A number between two bounds — duration, cost. The common bands are one
 * click; Min and Max take anything else, and either may be left empty.
 */
export function RangeFilter({
  field,
  unit,
  presets,
  value,
  onChange,
}: {
  field: string
  unit: string
  presets: Range[]
  value: Range | null
  onChange: (value: Range | null) => void
}) {
  const id = React.useId()
  const set = (next: Range) =>
    onChange(next.min === undefined && next.max === undefined ? null : next)
  const read = (raw: string) => (raw === "" ? undefined : Number(raw))
  const current = value ?? {}

  return (
    <Chip
      field={field}
      summary={rangeSummary(value, unit)}
      onClear={() => onChange(null)}
      trigger={(button) => (
        <Popover>
          <PopoverTrigger asChild>{button}</PopoverTrigger>
          <PopoverContent align="start" className="flex w-64 flex-col gap-3">
            <div className="flex flex-col gap-1">
              {presets.map((preset) => {
                const label = rangeSummary(preset, unit)!
                const on =
                  preset.min === value?.min && preset.max === value?.max
                return (
                  <Button
                    className="justify-start"
                    key={label}
                    onClick={() => set(preset)}
                    size="sm"
                    variant={on ? "secondary" : "ghost"}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              {(["min", "max"] as const).map((bound) => (
                <Field key={bound}>
                  <FieldLabel htmlFor={`${id}-${bound}`}>
                    {bound === "min" ? "Min" : "Max"}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={`${id}-${bound}`}
                      inputMode="numeric"
                      onChange={(event) =>
                        set({ ...current, [bound]: read(event.target.value) })
                      }
                      value={current[bound] ?? ""}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{unit}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    />
  )
}

/**
 * A filter that is either on or off — "Scheduled only". Clicking the chip
 * turns it on; there is nothing to choose, so nothing opens.
 */
export function ToggleFilter({
  field,
  value,
  onChange,
}: {
  field: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <ButtonGroup>
      <Button onClick={() => onChange(!value)} size="xs" variant="outline">
        {value ? (
          <span className="font-semibold">{field}</span>
        ) : (
          <>
            <AddIcon />
            {field}
          </>
        )}
      </Button>
      {value ? (
        <Button
          aria-label={`Clear ${field}`}
          onClick={() => onChange(false)}
          size="icon-xs"
          variant="outline"
        >
          <ClearIcon />
        </Button>
      ) : null}
    </ButtonGroup>
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
