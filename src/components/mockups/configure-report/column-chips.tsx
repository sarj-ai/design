"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"
import type { Column } from "@/lib/mockups/configure-report-data"

import { RemoveColumnIcon } from "./icons"

/** Spelled out per side: a variant must prefix every class, or the rest styles the chip itself. */
const DROP_LINE_BEFORE =
  "before:absolute before:top-0 before:-start-1 before:h-full before:w-0.5 before:rounded-full before:bg-primary before:content-['']"

const DROP_LINE_AFTER =
  "after:absolute after:top-0 after:-end-1 after:h-full after:w-0.5 after:rounded-full after:bg-primary after:content-['']"

const SAME_ROW = 4

type Landing = {
  at: number
  chip: number
  side: "before" | "after"
}

/** Pick the pointer's row first, then the slot in it; x alone breaks once chips wrap. */
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

  /* Past the last chip on this row: the line goes on its trailing edge, not the next row's start. */
  const last = chosen[chosen.length - 1]
  return { at: last + 1, chip: last, side: "after" }
}

/** The drop line is a pseudo-element (a real one reflows the row and the drag shakes). dragover and drop live on the wrapper so the gaps count. */
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

  /* Ref copy of `dragging`: a dragover in the same tick as dragstart still sees state as null. */
  const draggingRef = React.useRef<number | null>(null)
  /* A drop can follow its last dragover in one frame, so read the landing from the ref. */
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
        /* Only when the pointer leaves the group, not when it crosses between chips. */
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
          /* Removing the chip first shifts later slots down by one. */
          move(from, to.at > from ? to.at - 1 : to.at)
        }
        end()
      }}
    >
      {columns.map((column, index) => {
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
