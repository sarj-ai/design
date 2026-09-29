import type { SurfaceId } from "@/lib/design-system/data"
import { cn } from "@/lib/utils"

/**
 * Where the surface sits on the screen, at the size of a thumbnail.
 *
 * The grey block is the page, the grey bars are what is on it, and the purple
 * is the surface being chosen. That is the one thing the words cannot carry:
 * inline and a popover live *in* the page, undo leaves nothing but a toast, a
 * drawer and a record sit *beside* a page you can still see, a dialog and a
 * confirm cover a page that has gone quiet, and a page replaces it. A page
 * that has gone quiet is drawn fainter. Marked `aria-hidden` because the
 * surface's name and criterion say the same thing in words.
 */
export function SurfaceDiagram({ variant }: { variant: SurfaceId }) {
  if (variant === "inline") {
    return (
      <Frame>
        <Bar className="w-1/3" />
        <Row />
        {/* One row has become its own control — nothing opened. */}
        <div className="h-5 shrink-0 rounded-sm bg-primary" />
        <Row />
        <Row />
      </Frame>
    )
  }

  if (variant === "popover") {
    return (
      <Frame>
        <Bar className="w-1/3" />
        <div className="relative">
          <div className="h-4 w-1/4 rounded-sm bg-foreground/15" />
          {/* Anchored to the control that opened it, over the rows below. */}
          <div className="absolute top-5 left-0 flex h-16 w-2/5 flex-col gap-1 rounded-sm bg-primary p-1.5">
            <div className="h-1 w-3/4 rounded-sm bg-primary-foreground/60" />
            <div className="h-1 w-1/2 rounded-sm bg-primary-foreground/40" />
            <div className="h-1 w-2/3 rounded-sm bg-primary-foreground/40" />
          </div>
        </div>
        <Row />
        <Row />
        <Row />
      </Frame>
    )
  }

  if (variant === "undo") {
    return (
      <Frame className="relative">
        <Bar className="w-1/3" />
        <Row />
        <Row />
        <Row />
        {/* Nothing opened; the only mark is the toast in the corner. */}
        <div className="absolute inset-e-2 bottom-2 flex h-4 w-2/5 items-center justify-end rounded-sm bg-primary px-1.5">
          <div className="h-1 w-1/4 rounded-sm bg-primary-foreground" />
        </div>
      </Frame>
    )
  }

  if (variant === "dialog" || variant === "confirm") {
    return (
      <Frame className="relative">
        <Bar className="w-1/3 bg-foreground/5" />
        <div className="flex-1 rounded-sm bg-foreground/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* The confirm is the smaller of the two: a sentence and two
              buttons, where a dialog holds a few fields. */}
          <div
            className={
              variant === "confirm"
                ? "flex h-2/5 w-2/5 items-end justify-end gap-1 rounded-sm bg-primary p-1.5"
                : "flex h-3/5 w-1/2 items-end justify-end gap-1 rounded-sm bg-primary p-1.5"
            }
          >
            <div className="h-1.5 w-1/5 rounded-sm bg-primary-foreground/40" />
            <div className="h-1.5 w-1/5 rounded-sm bg-primary-foreground" />
          </div>
        </div>
      </Frame>
    )
  }

  if (variant === "drawer") {
    return (
      <Frame className="flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <Bar className="w-1/2" />
          <Row />
          <Row />
          <Row />
        </div>
        <div className="flex w-1/3 flex-col justify-end rounded-sm bg-primary p-1.5">
          <div className="flex justify-end gap-1">
            <div className="h-1.5 w-1/4 rounded-sm bg-primary-foreground/40" />
            <div className="h-1.5 w-1/4 rounded-sm bg-primary-foreground" />
          </div>
        </div>
      </Frame>
    )
  }

  if (variant === "record") {
    return (
      <Frame className="flex-row">
        {/* A sliver of the list stays in view: the record came from it. */}
        <div className="flex w-1/5 flex-col gap-2">
          <Bar className="w-3/4" />
          <Row />
          <Row />
          <Row />
        </div>
        <div className="flex flex-1 gap-1.5 rounded-sm bg-primary p-1.5">
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1 w-1/2 rounded-sm bg-primary-foreground/60" />
            <div className="h-1 w-3/4 rounded-sm bg-primary-foreground/40" />
            <div className="h-1 w-2/3 rounded-sm bg-primary-foreground/40" />
          </div>
          <div className="w-1/3 rounded-sm bg-primary-foreground/20" />
        </div>
      </Frame>
    )
  }

  /* Page: the old page is gone. The step rail marks the full-screen flow,
     the other half of what a page is for. */
  return (
    <Frame>
      <div className="flex flex-1 flex-col gap-2 rounded-sm bg-primary p-2">
        <div className="flex gap-1">
          <div className="h-1 flex-1 rounded-sm bg-primary-foreground" />
          <div className="h-1 flex-1 rounded-sm bg-primary-foreground/40" />
          <div className="h-1 flex-1 rounded-sm bg-primary-foreground/40" />
        </div>
        <div className="mx-auto mt-2 flex w-1/2 flex-col gap-1">
          <div className="h-1 w-2/3 rounded-sm bg-primary-foreground/60" />
          <div className="h-2 rounded-sm bg-primary-foreground/20" />
          <div className="h-2 rounded-sm bg-primary-foreground/20" />
        </div>
      </div>
    </Frame>
  )
}

function Frame({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-32 flex-col gap-2 overflow-hidden rounded-lg bg-muted p-2",
        className,
      )}
    >
      {children}
    </div>
  )
}

function Bar({ className }: { className?: string }) {
  return (
    <div className={cn("h-2 shrink-0 rounded-sm bg-foreground/10", className)} />
  )
}

function Row() {
  return <div className="h-5 shrink-0 rounded-sm bg-foreground/10" />
}
