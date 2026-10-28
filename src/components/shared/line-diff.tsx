"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DiffLine = { kind: "same" | "removed" | "added"; text: string }

/** Line-level diff by longest common subsequence; quadratic, fine for short prompts. */
function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n")
  const b = after.split("\n")
  const table = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0),
  )
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      table[i][j] =
        a[i] === b[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1])

  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ kind: "same", text: a[i] })
      i++
      j++
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      out.push({ kind: "removed", text: a[i++] })
    } else {
      out.push({ kind: "added", text: b[j++] })
    }
  }
  while (i < a.length) out.push({ kind: "removed", text: a[i++] })
  while (j < b.length) out.push({ kind: "added", text: b[j++] })
  return out
}

const LINE = "flex gap-2 px-3 py-1 whitespace-pre-wrap"
const REMOVED = "bg-destructive-tint text-destructive-tint-foreground"
const ADDED = "bg-success-tint text-success-tint-foreground"

export function LineDiff({ before, after }: { before: string; after: string }) {
  return (
    <div className="overflow-hidden rounded-lg border text-xs">
      {diffLines(before, after).map((line, index) => (
        <div
          key={index}
          dir="auto"
          className={cn(
            LINE,
            line.kind === "removed" && REMOVED,
            line.kind === "added" && ADDED,
            line.kind === "same" && "text-muted-foreground",
          )}
        >
          <span aria-hidden className="w-3 shrink-0 select-none">
            {line.kind === "removed" ? "−" : line.kind === "added" ? "+" : ""}
          </span>
          <span>{line.text}</span>
        </div>
      ))}
    </div>
  )
}

export function SideBySideDiff({
  before,
  after,
}: {
  before: string
  after: string
}) {
  const lines = diffLines(before, after)
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-lg border text-xs">
      <div className="border-e">
        {lines
          .filter((line) => line.kind !== "added")
          .map((line, index) => (
            <div
              key={index}
              dir="auto"
              className={cn(
                LINE,
                line.kind === "removed" ? REMOVED : "text-muted-foreground",
              )}
            >
              {line.text}
            </div>
          ))}
      </div>
      <div>
        {lines
          .filter((line) => line.kind !== "removed")
          .map((line, index) => (
            <div
              key={index}
              dir="auto"
              className={cn(
                LINE,
                line.kind === "added" ? ADDED : "text-muted-foreground",
              )}
            >
              {line.text}
            </div>
          ))}
      </div>
    </div>
  )
}

export function diffStat(before: string, after: string) {
  const lines = diffLines(before, after)
  return {
    added: lines.filter((line) => line.kind === "added").length,
    removed: lines.filter((line) => line.kind === "removed").length,
  }
}

export function DiffStat({
  added,
  removed,
}: {
  added: number
  removed: number
}) {
  return (
    <span className="flex items-center gap-2 text-xs font-medium tabular-nums">
      <span className={added ? "text-success" : "text-muted-foreground"}>
        +{added}
      </span>
      <span className={removed ? "text-destructive" : "text-muted-foreground"}>
        −{removed}
      </span>
    </span>
  )
}

type Side = { text: string; n: number; changed: boolean } | null
type Row = { changed: boolean; left: Side; right: Side }

function alignedRows(before: string, after: string): Row[] {
  const rows: Row[] = []
  let oldN = 0
  let newN = 0
  let removed: Side[] = []
  let added: Side[] = []
  const flush = () => {
    for (let i = 0; i < Math.max(removed.length, added.length); i++)
      rows.push({
        changed: true,
        left: removed[i] ?? null,
        right: added[i] ?? null,
      })
    removed = []
    added = []
  }
  for (const line of diffLines(before, after)) {
    if (line.kind === "same") {
      flush()
      oldN++
      newN++
      rows.push({
        changed: false,
        left: { text: line.text, n: oldN, changed: false },
        right: { text: line.text, n: newN, changed: false },
      })
    } else if (line.kind === "removed") {
      removed.push({ text: line.text, n: ++oldN, changed: true })
    } else {
      added.push({ text: line.text, n: ++newN, changed: true })
    }
  }
  flush()
  return rows
}

function unifiedRows(before: string, after: string) {
  let oldN = 0
  let newN = 0
  return diffLines(before, after).map((line) => {
    if (line.kind !== "added") oldN++
    if (line.kind !== "removed") newN++
    return {
      changed: line.kind !== "same",
      kind: line.kind,
      text: line.text,
      n: line.kind === "removed" ? oldN : newN,
    }
  })
}

function fold<T extends { changed: boolean }>(rows: T[], context: number) {
  const near = rows.map((_, index) =>
    rows
      .slice(Math.max(0, index - context), index + context + 1)
      .some((row) => row.changed),
  )
  const out: ({ row: T } | { hidden: T[]; id: number })[] = []
  rows.forEach((row, index) => {
    if (near[index]) {
      out.push({ row })
      return
    }
    const last = out[out.length - 1]
    if (last && "hidden" in last) last.hidden.push(row)
    else out.push({ hidden: [row], id: index })
  })
  return out.flatMap((piece) =>
    "hidden" in piece && piece.hidden.length === 1
      ? [{ row: piece.hidden[0] }]
      : [piece],
  )
}

const NUMBER =
  "w-7 shrink-0 text-end text-muted-foreground/60 tabular-nums select-none"

export function FoldedDiff({
  before,
  after,
  layout = "unified",
  context = 1,
  bare = false,
}: {
  before: string
  after: string
  layout?: "unified" | "split"
  context?: number
  bare?: boolean
}) {
  const [opened, setOpened] = React.useState<Set<number>>(new Set())
  const open = (id: number) => setOpened((current) => new Set([...current, id]))

  const frame = cn("text-xs", !bare && "overflow-hidden rounded-lg border")

  if (layout === "split") {
    const pieces = fold(alignedRows(before, after), context)
    return (
      <div className={frame}>
        {pieces.map((piece, index) =>
          "row" in piece || opened.has(piece.id) ? (
            ("row" in piece ? [piece.row] : piece.hidden).map((row, j) => (
              <div className="grid grid-cols-2" key={`${index}-${j}`}>
                <SplitCell side={row.left} tone={REMOVED} />
                <SplitCell className="border-s" side={row.right} tone={ADDED} />
              </div>
            ))
          ) : (
            <FoldRow
              count={piece.hidden.length}
              key={index}
              onOpen={() => open(piece.id)}
            />
          ),
        )}
      </div>
    )
  }

  const pieces = fold(unifiedRows(before, after), context)
  return (
    <div className={frame}>
      {pieces.map((piece, index) =>
        "row" in piece || opened.has(piece.id) ? (
          ("row" in piece ? [piece.row] : piece.hidden).map((row, j) => (
            <div
              className={cn(
                LINE,
                "ps-0",
                row.kind === "removed" && REMOVED,
                row.kind === "added" && ADDED,
                row.kind === "same" && "text-muted-foreground",
              )}
              dir="auto"
              key={`${index}-${j}`}
            >
              <span className={NUMBER}>{row.n}</span>
              <span aria-hidden className="w-3 shrink-0 select-none">
                {row.kind === "removed" ? "−" : row.kind === "added" ? "+" : ""}
              </span>
              <span>{row.text}</span>
            </div>
          ))
        ) : (
          <FoldRow
            count={piece.hidden.length}
            key={index}
            onOpen={() => open(piece.id)}
          />
        ),
      )}
    </div>
  )
}

function SplitCell({
  side,
  tone,
  className,
}: {
  side: Side
  tone: string
  className?: string
}) {
  return (
    <div
      className={cn(
        LINE,
        "ps-0",
        side?.changed ? tone : "text-muted-foreground",
        !side && "bg-muted/40",
        className,
      )}
      dir="auto"
    >
      <span className={NUMBER}>{side?.n ?? ""}</span>
      <span>{side?.text ?? ""}</span>
    </div>
  )
}

function FoldRow({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <div className="flex bg-muted/40 ps-8">
      <Button onClick={onOpen} size="xs" variant="ghost">
        {count === 1 ? "1 unchanged line" : `${count} unchanged lines`}
      </Button>
    </div>
  )
}
