import { cn } from "@/lib/utils"

/**
 * The frame every hairline drawing in the lab is drawn in — the nav panels'
 * and the design-system section cards'. `.claude/skills/sarj-figure` is the
 * register these follow; read it before drawing a new one.
 *
 * Every stroke is `currentColor`, so whoever places a figure owns its colour
 * and can lift the whole drawing with one class.
 */

export type FigureProps = { className?: string }

/* Hairlines, one weight, round ends: a drawing, not a diagram. */
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
      /* `size-auto` is load-bearing. Anywhere these are used inside a
         NavigationMenuLink, the primitive's own
         `[&_svg:not([class*='size-'])]:size-4` wins on specificity and cuts
         the drawing down to a 16px icon. Carrying a `size-` class at all is
         what opts out of that. */
      className={cn("size-auto w-full", className)}
      fill="none"
      viewBox={viewBox}
    >
      {children}
    </svg>
  )
}
