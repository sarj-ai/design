/**
 * The ring on `/design-system` — geometry and timing, with no React in it.
 *
 * Kept apart from the component for the same reason the reels kernel is: a
 * position that is wrong is far easier to reason about as a number returned by
 * a function than as a transform already painted on screen.
 *
 * The ring is an ellipse rather than a circle. A true circle of labels reads as
 * a list someone bent, while squashing the vertical axis reads as a disc lying
 * at an angle with the nodes travelling around its rim — which is the whole
 * point of arranging them this way rather than in the grid this page used to
 * be. `DEPTH_TILT` is that squash.
 *
 * Every value here is a pure function of an angle, an index and a clock, so the
 * ring can be asked what it looks like at any moment without having run up to
 * that moment first. That is what lets the entrance, the wheel and the exit all
 * read from one `rotation` number instead of each keeping their own.
 */

import { easeOutCubic, interpolate } from "@/lib/reels/anim"

/**
 * How far the vertical axis is squashed. 1 is a circle, 0 is a flat line.
 *
 * 0.4 was too flat to read as a ring at the top level, where there are only
 * five nodes: five labels on a very wide, very shallow ellipse look scattered
 * rather than arranged. Half is enough tilt for the eye to close the curve
 * while still reading as a disc seen at an angle rather than face on.
 */
const DEPTH_TILT = 0.52

/** Scale at the back of the ring and at the front, interpolated by depth. */
const DEPTH_SCALE = [0.74, 1] as const

/** Opacity at the back of the ring and at the front. */
const DEPTH_FADE = [0.45, 1] as const

/** Milliseconds between one node's arrival and the next one's. */
export const ARRIVE_STAGGER = 85

/** How long a single node takes to fly in. */
export const ARRIVE_DURATION = 720

/** How long the doc panel takes to climb from the bottom edge. */
export const ENTER_DURATION = 460

/**
 * Wheel travel to ring rotation, in degrees per pixel.
 *
 * Measured off the reference rather than guessed: six 400px wheel ticks turned
 * it 160 degrees, so a full turn costs roughly 5,400px of scrolling. Slower
 * than that and the ring feels stuck; faster and one trackpad flick spins it
 * past everything.
 */
export const WHEEL_TO_DEGREES = 0.067

/** Degrees per pixel of horizontal drag. */
export const DRAG_TO_DEGREES = 0.26

/** What one arrow-key press turns the ring by. */
export const KEY_STEP_DEGREES = 24

/**
 * How much of its speed the ring keeps each frame after the input stops.
 *
 * Applied per 16ms rather than per frame so a 120Hz screen does not coast for
 * half as long as a 60Hz one.
 */
export const SPIN_DECAY = 0.93

/** Below this, the coast is over and the loop can stop. */
export const SPIN_FLOOR = 0.015

export type OrbitNode = {
  /** Distance around the ring, 0 at the front and growing clockwise. */
  angle: number
  /** Centre offset in pixels, to be applied as a translate. */
  x: number
  y: number
  /** 0 at the back of the ring, 1 at the front. */
  depth: number
  scale: number
  opacity: number
  /** Paint order, so a node at the front covers one behind it. */
  z: number
}

/**
 * Where node `index` of `count` sits when the ring is turned `rotation` degrees.
 *
 * `radius` is the horizontal one; the vertical is that times `DEPTH_TILT`.
 */
export function orbitNode(
  index: number,
  count: number,
  rotation: number,
  radius: number,
): OrbitNode {
  /* Start at the bottom of the ellipse, not its right edge, so the first node
     of a freshly-formed ring is the one nearest the reader rather than one
     lying side-on where its label is hardest to read. */
  const angle = (index / Math.max(count, 1)) * 360 + rotation + 90
  const radians = (angle * Math.PI) / 180

  /* sin runs -1 at the back to 1 at the front, which is already the depth
     ramp — no second source of truth for which side of the ring a node is on. */
  const depth = (Math.sin(radians) + 1) / 2

  return {
    angle,
    depth,
    opacity: DEPTH_FADE[0] + depth * (DEPTH_FADE[1] - DEPTH_FADE[0]),
    scale: DEPTH_SCALE[0] + depth * (DEPTH_SCALE[1] - DEPTH_SCALE[0]),
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius * DEPTH_TILT,
    z: Math.round(depth * 100),
  }
}

/**
 * The entrance, as a multiplier on a node's settled position.
 *
 * A node does not fade in where it belongs. It arrives from further back around
 * the rim and closer to the centre, so the last thing it does before settling is
 * travel along the ring — the ring assembling itself rather than twelve labels
 * appearing at once. `swing` is the extra rotation it still has to give back.
 *
 * Returns `null` once the node has fully arrived, which is the caller's signal
 * that it can stop asking.
 */
export function orbitArrival(
  index: number,
  elapsed: number,
): { swing: number; pull: number; scale: number; opacity: number } | null {
  const start = index * ARRIVE_STAGGER
  const end = start + ARRIVE_DURATION

  if (elapsed >= end) return null

  const span = [start, end] as const

  return {
    opacity: interpolate(elapsed, span, [0, 1], { easing: easeOutCubic }),
    /* Ends at 1: the node is at its true radius by the time it settles. */
    pull: interpolate(elapsed, span, [0.52, 1], { easing: easeOutCubic }),
    scale: interpolate(elapsed, span, [0.42, 1], { easing: easeOutCubic }),
    swing: interpolate(elapsed, span, [-58, 0], { easing: easeOutCubic }),
  }
}

/** When every node of a ring this size has finished arriving. */
export function arrivalEnd(count: number): number {
  return Math.max(count - 1, 0) * ARRIVE_STAGGER + ARRIVE_DURATION
}

/**
 * The ring's horizontal radius for a stage of this size.
 *
 * Bounded on both axes: driven by width alone the nodes leave the top and
 * bottom of a short window, and driven by height alone they bunch into the
 * middle of a wide one. The cap keeps a very large screen from flinging the
 * ring out to its corners, where the centre it is supposed to be orbiting
 * stops reading as the middle of anything.
 */
export function orbitRadius(width: number, height: number): number {
  /* The cap is what keeps the top level legible. Uncapped on a wide monitor
     the five sections sit so far apart that nothing relates them, and the
     centre they orbit stops reading as a centre. */
  return Math.max(150, Math.min(width * 0.28, height * 0.72, 330))
}
