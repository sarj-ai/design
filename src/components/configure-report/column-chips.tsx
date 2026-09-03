"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"
import type { Column } from "@/lib/configure-report-data"

import { RemoveColumnIcon } from "./icons"

/**
 * Drawn in the gap beside a chip, on whichever side the chip would land.
 *
 * Spelled out per side because a variant has to prefix every class it covers —
 * `cn("before:-start-1", SHARED)` leaves the rest unprefixed and styles the
 * chip itself, which collapses it to a 2px sliver and reflows the row.
 */
const DROP_LINE_BEFORE =
  "before:absolute before:top-0 before:-start-1 before:h-full before:w-0.5 before:rounded-full before:bg-primary before:content-['']"

const DROP_LINE_AFTER =
  "after:absolute after:top-0 after:-end-1 after:h-full after:w-0.5 after:rounded-full after:bg-primary after:content-['']"

/** Two chips belong to the same visual row if their tops agree to the pixel. */
const SAME_ROW = 4

type Landing = {
  /** Where the chip goes, counted between chips. */
  at: number
  /** Which chip the line is drawn against, and on which side of it. */
  chip: number
  side: "before" | "after"
}

/**
 * Work out where a chip would land from the pointer, across wrapped rows.
 *
 * Comparing x alone is only right while every chip is on one line. Once the
 * list wraps, the chip nearest in x can be a row away, so the pointer's row is
 * picked first and the position within it second — which is also what makes
 * the end of one row and the start of the next tell themselves apart when they
 * are the same insertion index.
 */
function landingFor(x: number, y: number, boxes: DOMRect[]): Landing | null {
  if (boxes.length === 0) return null

  const rows: number[][] = []
  boxes.forEach((box, index) => {
    const row = rows.find(
      (indexes) => Math.abs(boxes[indexes[0]].top - box.top) < SAME_ROW,
    )
    if (row) row.push(index)
    else rows.push([index])
  })

  /* The row the pointer is inside, or the closest one when it is in the gap
     between rows or below the last of them. */
  let chosen = rows[0]
  let nearest = Number.POSITIVE_INFINITY
  for (const row of rows) {
    const box = boxes[row[0]]
    const distance =
      y < box.top ? box.top - y : y > box.bottom ? y - box.bottom : 0
    if (distance < nearest) {
      nearest = distance
      chosen = row
    }
  }

  for (const index of chosen) {
    const box = boxes[index]
    if (x < box.left + box.width / 2) {
      return { at: index, chip: index, side: "before" }
    }
  }

  /* Past the last chip on this row — the line belongs on its trailing edge,
     not at the start of the row below. */
  const last = chosen[chosen.length - 1]
  return { at: last + 1, chip: last, side: "after" }
}

/**
 * A set of columns as chips, in the order they will appear in the export.
 *
 * Each chip is two buttons in a ButtonGroup rather than one: the label is the
 * grab handle and the × is the only thing that removes. One button doing both
 * meant every attempt to pick a chip up deleted it — and the order is the
 * point here, since these are spreadsheet columns left to right.
 *
 * The drop line is a pseudo-element, not a real element spliced into the row.
 * A real one is 2px plus two gaps wide, so showing it reflowed every chip
 * after it, which slid a different chip under the pointer, which moved the
 * line again — the drag shook.
 *
 * Both dragover and drop are handled once on the wrapper rather than per chip.
 * The wrapper covers the gaps between chips and the space past the end of a
 * row, which a chip's own handler never sees, and one listener cannot fire
 * twice for one drop.
 */
export function ColumnChips({
  columns,
  onRemove,
  onReorder,
}: {
  columns: Column[]
  onRemove: (id: string) => void
  onReorder: (from: number, to: number) => void
}) {
  const [dragging, setDragging] = React.useState<number | null>(null)
  const [landing, setLanding] = React.useState<Landing | null>(null)

  /* The same value as `dragging`, kept where the handlers can read it without
     waiting for a render. A dragover that arrives in the same tick as the
     dragstart still sees state as null, and the first move of a drag is
     exactly when that happens — so the drag would ignore its own opening
     gesture. The state copy is only for the dimming. */
  const draggingRef = React.useRef<number | null>(null)
  /* Same reason: a drop can follow its last dragover inside one frame, and
     reading the landing from state there would drop the chip nowhere. */
  const landingRef = React.useRef<Landing | null>(null)

  function move(from: number, to: number) {
    if (to < 0 || to >= columns.length || from === to) return
    onReorder(from, to)
  }

  function end() {
    draggingRef.current = null
    landingRef.current = null
    setDragging(null)
    setLanding(null)
  }

  return (
    <div
      className="flex flex-wrap items-stretch gap-2"
      onDragOver={(event) => {
        /* Without preventDefault the browser refuses the drop. */
        event.preventDefault()
        if (draggingRef.current === null) return

        const boxes = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            ':scope > [data-slot="button-group"]',
          ),
        ].map((chip) => chip.getBoundingClientRect())

        const next = landingFor(event.clientX, event.clientY, boxes)
        landingRef.current = next

        setLanding((current) =>
          current &&
          next &&
          current.at === next.at &&
          current.chip === next.chip &&
          current.side === next.side
            ? current
            : next,
        )
      }}
      onDragLeave={(event) => {
        /* Only when the pointer actually leaves the group, not when it crosses
           between two chips inside it. */
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          landingRef.current = null
          setLanding(null)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        const from = draggingRef.current
        const to = landingRef.current
        if (from !== null && to !== null) {
          /* Removing the chip first shifts everything after it down one, so a
             landing slot past the chip's own position is one place too far. */
          move(from, to.at > from ? to.at - 1 : to.at)
        }
        end()
      }}
    >
      {columns.map((column, index) => {
        /* Both sides of the dragged chip put it back where it started, so
           neither gets a line — an indicator promising nothing is just one
           more thing flickering. */
        const noop =
          dragging !== null &&
          landing !== null &&
          (landing.at === dragging || landing.at === dragging + 1)
        const live = dragging !== null && landing !== null && !noop

        return (
          <ButtonGroup
            className={cn(
              "relative transition-opacity duration-150 ease-out-cubic select-none motion-reduce:transition-none",
              dragging === index && "opacity-50",
              live &&
                landing.chip === index &&
                landing.side === "before" &&
                DROP_LINE_BEFORE,
              live &&
                landing.chip === index &&
                landing.side === "after" &&
                DROP_LINE_AFTER,
            )}
            draggable
            key={column.id}
            onDragEnd={end}
            onDragStart={() => {
              draggingRef.current = index
              setDragging(index)
            }}
          >
            <Button
              className="cursor-grab active:cursor-grabbing"
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                  return
                event.preventDefault()
                move(index, index + (event.key === "ArrowLeft" ? -1 : 1))
              }}
              size="xs"
              title="Drag, or press the arrow keys, to reorder"
              type="button"
              variant="outline"
            >
              {column.label}
            </Button>

            <Button
              aria-label={`Remove ${column.label}`}
              onClick={() => onRemove(column.id)}
              size="icon-xs"
              type="button"
              variant="outline"
            >
              <RemoveColumnIcon />
            </Button>
          </ButtonGroup>
        )
      })}
    </div>
  )
}
