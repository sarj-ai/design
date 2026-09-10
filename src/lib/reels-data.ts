import { CallOutgoing01Icon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import { FPS } from "@/lib/reels/anim"

/**
 * The reel index. One video, one route, one card — the same contract the
 * mockup index runs on, for the same reason: a reel nobody can find is a reel
 * that gets rebuilt from scratch next release.
 *
 * A reel is **not** a filled-in template. Each one is its own React
 * composition under `src/components/reels/<slug>/`, written for what that
 * release actually shipped. The shared pieces — the canvas, the camera, the
 * type — are in `src/components/reels/`, and they are what keep every reel on
 * brand without making every reel look the same.
 */
export type Reel = {
  /** Route, and the reel's identity in this list. */
  href: string
  title: string
  /** Shape and length, e.g. "Release reel · 38s". */
  meta: string
  description: string
  icon: IconSvgElement
  /** Total frames. Must match the composition's own `DURATION`. */
  duration: number
}

export const REELS: Reel[] = [
  {
    href: "/reels/callback-tool",
    title: "Callback tool",
    meta: "Release reel · 38s",
    description:
      "The scheduling tool a scenario can hand a caller, shown in the scenario editor and on a live call.",
    icon: CallOutgoing01Icon,
    duration: 38 * FPS,
  },
  // `npm run new:reel` appends new reels above this line.
]

/** Seconds, for a card that wants to print a length. */
export function reelLength(reel: Reel): string {
  return `${Math.round(reel.duration / FPS)}s`
}
