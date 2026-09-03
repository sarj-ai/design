"use client"

import { cn } from "@/lib/utils"

/**
 * A clickable surface that is not a Button, ported from the revamped drawer.
 *
 * The transcript bubbles and the detection rows carry their own shape, and a
 * Button would fight its own padding and radius. Keyboard behaviour is the part
 * that has to be kept by hand.
 */
export function Seekable({
  children,
  className,
  label,
  onActivate,
}: {
  children: React.ReactNode
  className?: string
  label: string
  onActivate: () => void
}) {
  return (
    <div
      aria-label={label}
      className={cn(
        "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onActivate()
        }
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  )
}
