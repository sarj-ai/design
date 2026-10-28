"use client"

import { cn } from "@/lib/utils"

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
