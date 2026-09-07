"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  STATUS_GROUPS,
  type StatusGroupId,
} from "@/lib/conversations-revamp-list-data"
import {
  ChevronDownIcon,
  SelectedIcon,
} from "@/components/conversations-revamp/list/icons"

/**
 * The Status filter: a trigger that reads "Status" until something is ticked
 * and then "N selected", over the four groups with a Clear All footer. Applies
 * as you tick — there is no Apply button on this one.
 *
 * Five rows rather than fifteen. `STATUS_GROUPS` says why, and holds the raw
 * statuses each one stands for.
 */
export function StatusFilter({
  defaultOpen = false,
}: {
  /** Opens the list on load, so the dropdown has a link of its own. */
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [selected, setSelected] = React.useState<StatusGroupId[]>([])

  function toggle(group: StatusGroupId) {
    setSelected((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group],
    )
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Select Status"
          className={cn(
            "w-32 justify-between bg-card font-normal",
            !selected.length && "text-muted-foreground",
          )}
          variant="outline"
        >
          <span className="truncate">
            {selected.length === 0 ? (
              "Status"
            ) : selected.length === 1 ? (
              STATUS_GROUPS.find((group) => group.id === selected[0])?.label
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="font-medium">{selected.length}</span>
                <span className="text-muted-foreground">selected</span>
              </span>
            )}
          </span>
          <ChevronDownIcon
            className={cn(
              "ms-2 shrink-0 opacity-50 transition-transform duration-200 ease-out-cubic motion-reduce:transition-none",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-56 overflow-hidden p-0">
        <div className="flex flex-col">
          {/* Five rows still fit without scrolling, so the list needs no
              height cap and no inner scroller. */}
          <div className="p-1">
            {STATUS_GROUPS.map((group) => {
              const isSelected = selected.includes(group.id)

              return (
                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent",
                    isSelected && "bg-accent/50",
                  )}
                  key={group.id}
                  onClick={() => {
                    toggle(group.id)
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    className="pointer-events-none"
                  />
                  <span className="flex-1 cursor-pointer text-sm">
                    {group.label}
                  </span>
                  {isSelected ? (
                    <SelectedIcon className="size-4 text-primary opacity-50" />
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="shrink-0 border-t p-2">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  setSelected([])
                }}
                size="sm"
                variant="ghost"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
