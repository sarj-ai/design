import {
  CallOutgoing01Icon,
  NewReleasesIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
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
 *
 * `video` is the MP4 the index card plays inline, at
 * `public/reels/<slug>/reel.mp4`. A composition's is its `npm run reel`
 * output, copied there with `-movflags +faststart`. A reel made somewhere else
 * is only that file, and its route plays it with `VideoReelPage`. Keep each
 * file under 25 MB — Cloudflare will not serve a bigger static asset.
 */
export type Reel = {
  /** Route, and the reel's identity in this list. */
  href: string
  title: string
  /** Shape and length, e.g. "Release reel · 38s". */
  meta: string
  description: string
  icon: IconSvgElement
  /** Total frames. Must match the composition's own `DURATION`, or the
      file's length times `FPS` for a video reel. */
  duration: number
  /** The MP4 the index card plays, under `public/`. */
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

/** Seconds, for a card that wants to print a length. */
export function reelLength(reel: Reel): string {
  return `${Math.round(reel.duration / FPS)}s`
}

/** One reel by its route. */
export function reelAt(href: string): Reel {
  const reel = REELS.find((entry) => entry.href === href)
  if (!reel) throw new Error(`No reel at ${href} in REELS`)
  return reel
}
