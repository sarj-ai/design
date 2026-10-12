import { cn } from "@/lib/utils"

/*
 * The line diff from the design system's Unsaved changes topic
 * (save-bar-preview.tsx), shared because three places need it: the live
 * scenario save review (DES-203), and configuration versioning's save,
 * publish and compare (DES-202).
 */

type DiffLine = { kind: "same" | "removed" | "added"; text: string }

/** Line-level diff by longest common subsequence — prompts are short. */
export function diffLines(before: string, after: string): DiffLine[] {
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

/** Unchanged lines stay muted; only what changed carries colour. */
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

/**
 * The same diff as two columns — the older text on the start side, the
 * newer on the end — for comparing two versions where there is room. A line
 * that went is tinted on its side, a line that came on the other; unchanged
 * lines sit level in both so the eye can run across.
 */
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
