import { cn } from "@/lib/utils"

/** Every stroke is `currentColor`, so the parent owns the colour. */

export type FigureProps = { className?: string }

export const LINE = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export function Figure({
  children,
  className,
  viewBox = "0 0 520 320",
}: FigureProps & { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg
      aria-hidden="true"
      // `size-auto` is load-bearing: any `size-` class opts out of NavigationMenuLink's `[&_svg:not([class*='size-'])]:size-4`, which would shrink the drawing to 16px.
      className={cn("size-auto w-full", className)}
      fill="none"
      viewBox={viewBox}
    >
      {children}
    </svg>
  )
}
