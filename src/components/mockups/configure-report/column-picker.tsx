"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Column } from "@/lib/mockups/configure-report-data"

import { AddColumnIcon } from "./icons"

/** Filtered here, not by cmdk, because "Select all" must know exactly which rows are shown. */
export function ColumnPicker({
  emptyLabel,
  onChange,
  options,
  placeholder,
  selected,
}: {
  emptyLabel: string
  onChange: (columns: Column[]) => void
  options: Column[]
  placeholder: string
  selected: Column[]
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const selectAllId = React.useId()

  const on = new Set(selected.map((column) => column.id))

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? options.filter((option) => option.label.toLowerCase().includes(needle))
    : options

  const allVisibleOn = visible.length > 0 && visible.every((o) => on.has(o.id))

  /** Columns already on keep their place; newly ticked ones append in list order. */
  function apply(next: Set<string>) {
    const kept = selected.filter((column) => next.has(column.id))
    const added = options.filter(
      (option) => next.has(option.id) && !on.has(option.id),
    )
    onChange([...kept, ...added])
  }

  function toggle(option: Column) {
    const next = new Set(on)
    if (next.has(option.id)) next.delete(option.id)
    else next.add(option.id)
    apply(next)
  }

  function toggleVisible() {
    const next = new Set(on)
    for (const option of visible) {
      if (allVisibleOn) next.delete(option.id)
      else next.add(option.id)
    }
    apply(next)
  }

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next)
        /* A search left behind from last time reads as an empty group. */
        if (!next) setQuery("")
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <Button variant="outline">
          Add
          <AddColumnIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={setQuery}
            placeholder={placeholder}
            value={query}
          />

          <div className="mx-1 mt-1 border-b pb-1">
            <Label
              className="rounded-sm px-2 py-2.5 hover:bg-muted"
              htmlFor={selectAllId}
            >
              <Checkbox
                checked={allVisibleOn}
                disabled={visible.length === 0}
                id={selectAllId}
                onCheckedChange={toggleVisible}
              />
              {needle
                ? `${allVisibleOn ? "Clear" : "Select"} ${visible.length} ${
                    visible.length === 1 ? "match" : "matches"
                  }`
                : allVisibleOn
                  ? "Clear all"
                  : "Select all"}
              <span className="ms-auto text-xs font-normal text-muted-foreground">
                {selected.length} of {options.length} on
              </span>
            </Label>
          </div>

          <CommandList className="pt-1">
            {visible.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {emptyLabel}
              </p>
            ) : (
              <CommandGroup>
                {visible.map((option) => (
                  <CommandItem
                    key={option.id}
                    onSelect={() => toggle(option)}
                    value={option.id}
                  >
                    {/* The row is the hit target; a checkbox that also took clicks would toggle twice. */}
                    <Checkbox
                      checked={on.has(option.id)}
                      className="pointer-events-none"
                      tabIndex={-1}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
