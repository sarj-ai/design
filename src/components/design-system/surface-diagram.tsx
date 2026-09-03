import type { SurfaceChoice } from "@/lib/design-system-data"

/**
 * Where the surface sits on the screen, at the size of a thumbnail.
 *
 * The grey block is the page, the grey bars are what is on it, and the purple
 * block is the surface being chosen. That is the one thing the words cannot
 * carry: inline is *in* the page, a drawer sits beside a page you can still
 * read, and a modal covers a page that has gone quiet. Marked `aria-hidden`
 * because the criterion beside it says the same thing in words.
 */
export function SurfaceDiagram({ variant }: { variant: SurfaceChoice["id"] }) {
  if (variant === "inline") {
    return (
      <div
        aria-hidden
        className="flex h-32 flex-col gap-2 rounded-lg bg-muted p-2"
      >
        <div className="h-2 w-1/3 rounded-sm bg-foreground/10" />
        <div className="flex-1 rounded-sm bg-primary" />
      </div>
    )
  }

  if (variant === "drawer") {
    return (
      <div aria-hidden className="flex h-32 gap-2 rounded-lg bg-muted p-2">
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-2 w-1/2 rounded-sm bg-foreground/10" />
          <div className="flex-1 rounded-sm bg-foreground/10" />
        </div>
        <div className="w-2/5 rounded-sm bg-primary" />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className="relative flex h-32 flex-col gap-2 rounded-lg bg-muted p-2"
    >
      {/* Dimmer than the other two on purpose — the page behind a modal is the
          page you have stopped needing. */}
      <div className="h-2 w-1/3 rounded-sm bg-foreground/5" />
      <div className="flex-1 rounded-sm bg-foreground/5" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-3/5 w-3/5 rounded-sm bg-primary" />
      </div>
    </div>
  )
}
