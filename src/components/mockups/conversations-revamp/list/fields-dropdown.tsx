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
  COLUMN_LABELS,
  DEFAULT_COLUMNS,
  type ColumnId,
  type ColumnSetting,
} from "@/lib/mockups/conversations-revamp-list-data"
import {
  DragHandleIcon,
  FieldsIcon,
} from "@/components/mockups/conversations-revamp/list/icons"

export function FieldsDropdown({
  columns,
  onChange,
}: {
  columns: ColumnSetting[]
  onChange: (columns: ColumnSetting[]) => void
}) {
  const [dragging, setDragging] = React.useState<ColumnId | null>(null)
  const [dropAt, setDropAt] = React.useState<null | number>(null)

  const shown = columns.filter((column) => column.visible).length

  function move(from: number, to: number) {
    if (to < 0 || to >= columns.length || from === to) return
    const next = [...columns]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  // Drop uses an insertion point, which shifts once the row is lifted out.
  function moveTo(from: number, insertAt: number) {
    const next = [...columns]
    const [moved] = next.splice(from, 1)
    next.splice(insertAt > from ? insertAt - 1 : insertAt, 0, moved)
    onChange(next)
  }

  function toggle(id: ColumnId) {
    onChange(
      columns.map((column) =>
        column.id === id ? { ...column, visible: !column.visible } : column,
      ),
    )
  }

  function endDrag() {
    setDragging(null)
    setDropAt(null)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Choose fields"
          className="bg-card font-normal"
          variant="outline"
        >
          <FieldsIcon className="text-muted-foreground" />
          Fields
          {shown < columns.length ? (
            <span className="text-muted-foreground">
              {shown}/{columns.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="flex w-64 flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Fields</span>
          <span className="text-sm text-muted-foreground">
            Drag to reorder. Untick to take a column off the table.
          </span>
        </div>

        <div className="flex flex-col">
          {columns.map((column, index) => (
            <div
              className={cn(
                "relative flex items-center gap-2 rounded-lg py-1 pe-2 transition-opacity duration-150 ease-out-cubic motion-reduce:transition-none",
                dragging === column.id && "opacity-40",
              )}
              draggable
              key={column.id}
              onDragEnd={endDrag}
              onDragOver={(event) => {
                event.preventDefault()
                const box = event.currentTarget.getBoundingClientRect()
                const below = event.clientY > box.top + box.height / 2
                setDropAt(below ? index + 1 : index)
              }}
              onDragStart={() => {
                setDragging(column.id)
              }}
              onDrop={() => {
                const from = columns.findIndex((entry) => entry.id === dragging)
                if (from !== -1 && dropAt !== null) moveTo(from, dropAt)
                endDrag()
              }}
            >
              {dropAt === index ? <DropLine className="-top-px" /> : null}
              {dropAt === columns.length && index === columns.length - 1 ? (
                <DropLine className="-bottom-px" />
              ) : null}

              <Button
                aria-label={`Reorder ${COLUMN_LABELS[column.id]}`}
                className="shrink-0 cursor-grab text-muted-foreground"
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault()
                    move(index, index - 1)
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault()
                    move(index, index + 1)
                  }
                }}
                size="icon-xs"
                variant="ghost"
              >
                <DragHandleIcon />
              </Button>

              <span className="flex-1 truncate text-sm">
                {COLUMN_LABELS[column.id]}
              </span>

              <Checkbox
                aria-label={`Show ${COLUMN_LABELS[column.id]}`}
                checked={column.visible}
                onCheckedChange={() => {
                  toggle(column.id)
                }}
              />
            </div>
          ))}
        </div>

        <Button
          className="self-end"
          onClick={() => {
            onChange(DEFAULT_COLUMNS)
          }}
          size="sm"
          variant="ghost"
        >
          Reset
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function DropLine({ className }: { className: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-x-0 h-0.5 rounded-sm bg-primary",
        className,
      )}
    />
  )
}
