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
import type { Column } from "@/lib/configure-report-data"

import { AddColumnIcon } from "./icons"

/**
 * Picks every column in one group at once.
 *
 * Checkboxes rather than a menu that adds one row and shuts: a report is
 * usually built by taking most of a group, and doing that a click and a reopen
 * at a time is the thing reviewers keep asking us to stop making them do. The
 * list stays open, ticking is instant, and "Select all" takes the whole group
 * — or, once a search is typed, just what the search matched.
 *
 * Every option is shown, with the ones already on the report ticked, so the
 * list reads as the group's state rather than as a pile of leftovers. That
 * makes unticking a removal, which is the same edit the chip's × makes.
 *
 * Search is filtered here rather than by cmdk, because "Select all" has to
 * know exactly which rows are on screen to act on them.
 */
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

  /**
   * Whatever was already on keeps its place — these are spreadsheet columns,
   * and reordering them behind the reader's back is worse than any tidiness
   * gained. Newly ticked ones land at the end, in the order this list has
   * them, so a "Select all" produces the group top to bottom.
   */
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

          {/* Outside the list, so it cannot scroll away from the rows it
              acts on.

              PADDED ON BOTH SIDES, which it was not: the air above it was a
              margin and the air below it was padding, so the row's own box
              started at the label and the divider sat 12px under it with
              nothing above. The label read as a caption hanging off the search
              field rather than as the head of the list, and the row measured
              29px against the 32px of every option beneath it — a header
              shorter than its own contents.

              `py-2.5` gives the label equal air on both sides and makes the row
              the tallest thing in the list, which is what a header should be.
              The remaining `mt-1` is separation from the input above, not part
              of the row. */}
          {/* The whole row is the label, not just its words. As a bare box
              beside a checkbox it was the one row in the popover that did not
              light up under the pointer and did not answer a click off the
              text — so it read as a caption, and people aimed at the 16px
              checkbox. Same inset and the same `bg-muted` fill the options
              use, so it behaves like the list it heads. */}
          {/* `pb-1` matches the `mt-1` above, so the row's hover fill has the
              same 4px of clearance top and bottom. Without it the fill's
              rounded bottom corners land on the divider and the two read as
              one smudged edge. */}
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
              {/* Named for exactly what it will touch. Once a search is typed
                  this row acts on the matches only, and a bare "Clear" beside
                  two visible rows reads as if it empties the whole group. */}
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

          {/* Only the top. The rows carry their own hover fill and need
              clearing from the divider, but the frame's own padding already
              gives the last one 8px — pad both ends and the bottom comes out
              at 12 against the top's 8, which reads as a slipped margin. */}
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
                    {/* The row is the hit target — a checkbox that also took
                        clicks would swallow half of them and toggle twice. */}
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
