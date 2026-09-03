"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Circle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

/**
 * Aceternity's multi-step-loader, kept for its two ideas — the step column
 * that travels so the active step stays put while finished ones recede, and
 * the blurred backdrop — but rebuilt on brand tokens. The upstream version
 * ships `text-black`, `dark:text-lime-500` and `bg-white dark:bg-black`, which
 * die on the theme flip and the tasama whitelabel.
 *
 * Two other deviations from upstream:
 * - `value` is controlled. The caller owns the timer because it also drives
 *   the progress bar, the step count, and the failure branch.
 * - The backdrop is a separate export, so the steps can render inline.
 */

export type LoadingState = {
  text: string
}

/** Row height (20px line + 16px gap) — the per-step travel distance. */
const STEP_OFFSET = 40
/** Rows the clipped viewport shows at once. Keep in sync with `h-50` below. */
const VISIBLE_STEPS = 5

export function MultiStepLoader({
  loadingStates,
  value = 0,
  className,
}: {
  loadingStates: LoadingState[]
  value?: number
  className?: string
}) {
  // Hold the active step one row down from the top, but never scroll past the
  // ends — otherwise the column opens with empty rows above the first step and
  // closes with empty rows below the last one.
  const maxTravel = Math.max(0, loadingStates.length - VISIBLE_STEPS)
  const travel = Math.min(Math.max(0, value - 1), maxTravel) * STEP_OFFSET

  return (
    <div
      className={cn("relative h-50 w-full overflow-hidden", className)}
      // Every row is on screen at once, so a live region here would re-read all
      // of them on each tick. The caller owns one `role="status"` line instead.
      aria-hidden="true"
    >
      {loadingStates.map((state, index) => {
        const distance = Math.abs(index - value)
        // Floor at 0.2 rather than 0: upstream fades the furthest row to
        // nothing, which leaves a blank row inside the viewport on step 1.
        const opacity = Math.max(1 - distance * 0.2, 0.2)
        const done = index < value
        const active = index === value

        return (
          <motion.div
            key={state.text}
            className="mb-4 flex items-center gap-2 text-start"
            initial={{ opacity: 0, y: -travel }}
            animate={{ opacity, y: -travel }}
            transition={{ duration: 0.5 }}
          >
            <span className="flex size-5 shrink-0 items-center justify-center">
              {done ? <Check className="size-5 text-primary" /> : null}
              {active ? <Spinner className="size-5 text-primary" /> : null}
              {!done && !active ? (
                <Circle className="size-5 text-muted-foreground" />
              ) : null}
            </span>
            <span
              className={cn(
                "text-base",
                active ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {state.text}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

/** The blurred backdrop the step column sits on. */
export function MultiStepLoaderOverlay({
  loading,
  className,
  children,
}: {
  loading?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-background/70 p-6 backdrop-blur-sm motion-reduce:transition-none",
            className
          )}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
