// A reel is a pure function of the frame number: no timers, CSS transitions or `animate-*`,
// so the browser preview and the rendered MP4 cannot disagree.

export const FPS = 30

export function seconds(value: number): number {
  return Math.round(value * FPS)
}

export function timecode(frame: number): string {
  const total = Math.max(0, Math.round(frame / FPS))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, "0")}`
}

export type Rect = { x: number; y: number; width: number; height: number }

export type Easing = (t: number) => number

// Fixed iteration count, not a tolerance, so a frame renders identically on every machine.
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

/** Must match `--ease-out-cubic` in globals.css. */
export const easeOutCubic = cubicBezier(0.215, 0.61, 0.355, 1)

/** Must match `--ease-in-out-cubic` in globals.css. */
export const easeInOutCubic = cubicBezier(0.645, 0.045, 0.355, 1)

export const easeOutBack: Easing = (t) =>
  1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2

export const linear: Easing = (t) => t

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

export function stagger(index: number, step = 4, base = 0): number {
  return base + index * step
}
