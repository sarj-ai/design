"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Place it last in a column at least as tall as the scroll area (`min-h-full flex flex-col`): `mt-auto` holds it down on a short page, `sticky` on a long one. */
export function SaveBar({
  changes,
  onDiscard,
  onSave,
}: {
  changes: number
  onDiscard: () => void
  onSave: () => void
}) {
  const shown = changes > 0

  return (
    <div
      className={cn(
        "pointer-events-none sticky bottom-4 mt-auto flex justify-center transition duration-200 ease-out-cubic motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
      inert={!shown}
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-xl bg-foreground py-1 ps-4 pe-1 text-background">
        <span className="me-2 text-sm tabular-nums">
          {changes === 1 ? "1 change" : `${changes} changes`}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="text-background hover:bg-background/10 hover:text-background"
          onClick={onDiscard}
        >
          Discard
        </Button>
        <Button
          size="sm"
          className="bg-background text-foreground hover:bg-background/90"
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </div>
  )
}
