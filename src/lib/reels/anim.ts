/**
 * The animation kernel every reel is built on.
 *
 * One rule holds the whole system together: **a reel is a pure function of one
 * integer.** Given a frame number, the composition renders exactly one picture,
 * every time, on any machine. No timers, no CSS transitions, no `animate-*`.
 *
 * That single constraint is what lets the browser preview and the MP4 render be
 * the same code. Playback is a rAF loop that advances the number; rendering is
 * a Playwright loop that sets the number and screenshots. Neither knows about
 * the other, and they cannot disagree — which is the failure mode of recording
 * a screen: the recording is a performance, and a performance is different
 * every take.
 *
 * The easings are the design system's own curves from globals.css, ported to
 * JS. They have to be values here rather than `ease-out-cubic` classes, because
 * the whole point is that nothing animates itself.
 */

/** Frames per second, everywhere. 30 is plenty for UI motion and halves the
 *  render time against 60 — there is no fast pan in a product reel. */
export const FPS = 30

/** Seconds to frames. Compositions are written in seconds and read in frames. */
export function seconds(value: number): number {
  return Math.round(value * FPS)
}

/** Frames back to a clock string, for the player's timecode. */
export function timecode(frame: number): string {
  const total = Math.max(0, Math.round(frame / FPS))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, "0")}`
}

/** A rectangle in some source's own pixels — a screenshot's, usually. */
export type Rect = { x: number; y: number; width: number; height: number }

export type Easing = (t: number) => number

/**
 * A cubic-bezier solver, Newton-Raphson with a fixed iteration count.
 *
 * Fixed rather than converging on a tolerance so the answer never depends on
 * how long the machine was willing to think about it — a frame rendered on a
 * busy laptop has to equal the same frame rendered on CI.
 */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
  const a = (m: number, n: number) => 1 - 3 * n + 3 * m
  const b = (m: number, n: number) => 3 * n - 6 * m
  const c = (m: number) => 3 * m

  const calc = (t: number, m: number, n: number) =>
    ((a(m, n) * t + b(m, n)) * t + c(m)) * t
  const slope = (t: number, m: number, n: number) =>
    3 * a(m, n) * t * t + 2 * b(m, n) * t + c(m)

  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1

    let t = x
    for (let i = 0; i < 8; i += 1) {
      const d = slope(t, x1, x2)
      if (d === 0) break
      t -= (calc(t, x1, x2) - x) / d
    }

    return calc(t, y1, y2)
  }
}

/** `--ease-out-cubic`. Anything entering or leaving. */
export const easeOutCubic = cubicBezier(0.215, 0.61, 0.355, 1)

/** `--ease-in-out-cubic`. An on-screen element resizing or moving. */
export const easeInOutCubic = cubicBezier(0.645, 0.045, 0.355, 1)

/**
 * Overshoots past the target and settles back.
 *
 * The one curve here with no counterpart in `globals.css`, and deliberately so:
 * nothing in the app overshoots, because overshoot on a real control reads as
 * a bug. On a cursor release it is the opposite — it is the only thing that
 * makes a click read as a click rather than a scale animation.
 */
export const easeOutBack: Easing = (t) =>
  1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2

/** No curve. For a camera drift that must not accelerate. */
export const linear: Easing = (t) => t

/**
 * Map a frame onto a value through a set of stops.
 *
 *     interpolate(frame, [0, 12], [0, 1])            // fade in over 12 frames
 *     interpolate(frame, [0, 12, 90, 102], [0, 1, 1, 0])  // in, hold, out
 *
 * Clamps at both ends by default, because an un-clamped value that keeps
 * growing past its last stop is never what a composition wants and is
 * invisible until the one frame where it flies off the canvas.
 */
export function interpolate(
  frame: number,
  input: readonly number[],
  output: readonly number[],
  options: { easing?: Easing; clamp?: boolean } = {},
): number {
  const { easing = easeOutCubic, clamp = true } = options

  if (input.length !== output.length || input.length < 2) {
    throw new Error("interpolate needs matching input and output stops")
  }

  if (clamp) {
    if (frame <= input[0]) return output[0]
    if (frame >= input[input.length - 1]) return output[output.length - 1]
  }

  let i = 0
  while (i < input.length - 2 && frame >= input[i + 1]) i += 1

  const span = input[i + 1] - input[i]
  const progress = span === 0 ? 0 : (frame - input[i]) / span

  return output[i] + easing(progress) * (output[i + 1] - output[i])
}

/**
 * The entrance every element shares: rise a little, fade in.
 *
 * Returns a style object rather than classes because the value changes every
 * frame — this is exactly the "dynamic geometry" the style prop is for.
 *
 * `distance` is in canvas pixels. Keep it small: 16–32px reads as arrival,
 * 80px reads as a slide transition and pulls the eye off the words.
 */
export function enter(
  frame: number,
  options: { delay?: number; duration?: number; distance?: number } = {},
): { opacity: number; transform: string } {
  const { delay = 0, duration = 14, distance = 20 } = options
  const at = [delay, delay + duration]

  return {
    opacity: interpolate(frame, at, [0, 1]),
    transform: `translateY(${interpolate(frame, at, [distance, 0]).toFixed(3)}px)`,
  }
}

/**
 * The matching exit, measured from the end of a scene.
 *
 * A scene that only enters leaves a hard cut on its last frame. That reads as a
 * dropped frame rather than an edit, so every scene should either exit or be
 * covered by the next one arriving.
 */
export function exit(
  frame: number,
  sceneDuration: number,
  options: { duration?: number; distance?: number } = {},
): { opacity: number; transform: string } {
  const { duration = 12, distance = 16 } = options
  const start = sceneDuration - duration
  const at = [start, sceneDuration]

  return {
    opacity: interpolate(frame, at, [1, 0], { easing: easeInOutCubic }),
    transform: `translateY(${interpolate(frame, at, [0, -distance], {
      easing: easeInOutCubic,
    }).toFixed(3)}px)`,
  }
}

/** Enter and exit in one call — what most elements actually want. */
export function through(
  frame: number,
  sceneDuration: number,
  options: { delay?: number; distance?: number } = {},
): { opacity: number; transform: string } {
  const { delay = 0, distance = 20 } = options
  const a = enter(frame, { delay, distance })
  const b = exit(frame, sceneDuration)

  return {
    opacity: Math.min(a.opacity, b.opacity),
    transform: `translateY(${(
      interpolate(frame, [delay, delay + 14], [distance, 0]) +
      interpolate(frame, [sceneDuration - 12, sceneDuration], [0, -16], {
        easing: easeInOutCubic,
      })
    ).toFixed(3)}px)`,
  }
}

/** Nth item's delay in a staggered group. Keep `step` at 3–5 frames. */
export function stagger(index: number, step = 4, base = 0): number {
  return base + index * step
}
