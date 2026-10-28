import {
  CallOutgoing01Icon,
  NewReleasesIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import { FPS } from "@/lib/reels/anim"

export type Reel = {
  href: string
  title: string
  meta: string
  description: string
  icon: IconSvgElement
  /** Total frames. Must match the composition's `DURATION`, or the file's length times `FPS`. */
  duration: number
  /** Under `public/`. Keep it under 25 MB: Cloudflare will not serve a bigger static asset. */
  video?: string
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
    video: "/reels/callback-tool/reel.mp4",
  },
  {
    href: "/reels/sarj-motion",
    title: "Sarj motion",
    meta: "Brand film · 25s",
    description:
      "The platform in one film: unstructured data in, conversations and workflows automated.",
    icon: Video01Icon,
    duration: 25 * FPS,
    video: "/reels/sarj-motion/reel.mp4",
  },
  {
    href: "/reels/release-32",
    title: "Release 32",
    meta: "Release reel · 1m 14s",
    description:
      "What is new for callers in release 32, from a call's goodbye to the mobile dashboard.",
    icon: NewReleasesIcon,
    duration: 74 * FPS,
    video: "/reels/release-32/reel.mp4",
  },
  // `npm run new:reel` appends new reels above this line.
]

export function reelAt(href: string): Reel {
  const reel = REELS.find((entry) => entry.href === href)
  if (!reel) throw new Error(`No reel at ${href} in REELS`)
  return reel
}
