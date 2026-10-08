import { cn } from "@/lib/utils"

/*
 * The line diff from the design system's Unsaved changes topic
 * (save-bar-preview.tsx), copied here because that file does not export it
 * and a mockup must not reach into a preview's internals.
 */

type DiffLine = { kind: "same" | "removed" | "added"; text: string }

/** Line-level diff by longest common subsequence — prompts are short. */
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

/** Unchanged lines stay muted; only what changed carries colour. */
export function LineDiff({ before, after }: { before: string; after: string }) {
  return (
    <div className="overflow-hidden rounded-lg border text-xs">
      {diffLines(before, after).map((line, index) => (
        <div
          key={index}
          dir="auto"
          className={cn(
            "flex gap-2 px-3 py-1 whitespace-pre-wrap",
            line.kind === "removed" &&
              "bg-destructive-tint text-destructive-tint-foreground",
            line.kind === "added" &&
              "bg-success-tint text-success-tint-foreground",
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
