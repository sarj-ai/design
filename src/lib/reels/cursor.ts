/**
 * A scripted cursor for reels.
 *
 * A tour is authored as verbs — park, enter, move to a region, click, wait,
 * zoom — and compiled into keyframe tracks laid out on one clock. Playback is
 * "sample every track at time t", which is the same contract the rest of the
 * reel system runs on: a pure function of the playhead, so the browser preview
 * and the rendered MP4 cannot disagree.
 *
 * Ported from a scripted product tour in Vansh's reverse-engineer vault
 * (`rebuild` of tines.com's demo player). The technique travels; none of its
 * styling does. That original leans on drop shadows and its own palette, both
 * of which this repo bans — the cursor here is a stroked shape on brand
 * tokens.
 *
 * **Targets are named regions, never pixels.** A script says `moveTo("save")`
 * and that resolves against a registry of rects the composition already
 * declares for `<Shot focus>` and `<Spotlight>`. Two upgrades fall out of
 * naming them:
 *
 * - Regions are in the **screenshot's own pixels**, so the cursor lands on the
 *   same control no matter how the shot is framed or zoomed.
 * - Nothing is measured from the DOM, so a tour compiles identically on every
 *   machine. The original had to remeasure on resize; this cannot drift.
 */

import {
  easeInOutCubic,
  easeOutBack,
  type Easing,
  type Rect,
} from "@/lib/reels/anim"

/** Where the pointer is, how big, and how visible. */
export type Pose = { x: number; y: number; scale: number; opacity: number }

/** Camera centre and zoom, in the screenshot's own pixels. */
export type Cam = { x: number; y: number; z: number }

/** Named regions of one screenshot. */
export type Regions = Record<string, Rect>

type Key<T> = { t: number; value: T; ease: Easing }
type Track<T> = Key<T>[]

export type Tour = {
  /** Seconds. */
  duration: number
  pose: Track<Pose>
  cam: Track<Cam>
  /** When each click released, for the ripple. */
  clicks: number[]
  source: { width: number; height: number }
}

/**
 * Parks a track on its previous value for the whole segment.
 *
 * Every verb writes a keyframe to *every* track so the tracks stay
 * time-aligned. The tracks a verb did not touch get this easing, so they hold
 * rather than drifting toward the next key they happen to have.
 */
const hold: Easing = () => 0

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (lo: number, v: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

/**
 * Travel time is derived from distance, not fixed.
 *
 * This is most of why the motion reads as a hand rather than a tween: a short
 * hop between two fields stays quick, and a sweep across the screen never
 * drags. The speed is expressed as a fraction of the screenshot's width so a
 * 2880px capture and a 1440px one feel identical — a fixed px/s figure would
 * make the same gesture twice as slow on a 2x capture.
 */
const CROSS_SCREEN_SECONDS = 1.75
const MIN_TRAVEL = 0.4
const MAX_TRAVEL = 1.6

/** Index of the last key at or before `time`. */
function keyAt<T>(track: Track<T>, time: number): number {
  let lo = 0
  let hi = track.length - 1

  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (track[mid].t <= time) lo = mid
    else hi = mid - 1
  }

  return lo
}

/**
 * Sample a track at `time`.
 *
 * The easing belongs to the *destination* keyframe: the segment between keys
 * i and i+1 is shaped by `track[i + 1].ease`.
 */
function sample<T>(
  track: Track<T>,
  time: number,
  mix: (a: T, b: T, t: number) => T,
): T {
  const i = keyAt(track, time)
  const a = track[i]
  const b = track[i + 1]
  if (!b) return a.value

  const span = b.t - a.t
  const progress = span <= 0 ? 1 : clamp(0, (time - a.t) / span, 1)

  return mix(a.value, b.value, b.ease(progress))
}

const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  scale: lerp(a.scale, b.scale, t),
  opacity: lerp(a.opacity, b.opacity, t),
})

const mixCam = (a: Cam, b: Cam, t: number): Cam => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  z: lerp(a.z, b.z, t),
})

class TourBuilder {
  private clock = 0
  private pose: Pose = { x: 0, y: 0, opacity: 0, scale: 1 }
  private cam: Cam
  private poseKeys: Track<Pose> = []
  private camKeys: Track<Cam> = []
  private clicks: number[] = []
  private speed: number

  constructor(
    private regions: Regions,
    private source: { width: number; height: number },
  ) {
    this.cam = { x: source.width / 2, y: source.height / 2, z: 1 }
    this.speed = source.width / CROSS_SCREEN_SECONDS
    this.pose = { x: source.width / 2, y: source.height / 2, opacity: 0, scale: 1 }
    this.write({}, hold)
  }

  private write(next: { pose?: Pose; cam?: Cam }, ease: Easing) {
    if (next.pose) this.pose = next.pose
    if (next.cam) this.cam = next.cam

    this.poseKeys.push({
      t: this.clock,
      value: { ...this.pose },
      ease: next.pose ? ease : hold,
    })
    this.camKeys.push({
      t: this.clock,
      value: { ...this.cam },
      ease: next.cam ? ease : hold,
    })
  }

  private centre(id: string): { x: number; y: number } | null {
    const rect = this.regions[id]
    if (!rect) return null
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  }

  /** Place the cursor with no travel. Use once, before it appears. */
  parkAt(id: string) {
    const at = this.centre(id) ?? { x: this.pose.x, y: this.pose.y }
    this.write({ pose: { ...at, opacity: 0, scale: 1 } }, hold)
    return this
  }

  /** Fade the cursor in where it already sits. */
  enter(duration = 0.45) {
    this.clock += duration
    this.write(
      { pose: { x: this.pose.x, y: this.pose.y, opacity: 1, scale: 1 } },
      easeInOutCubic,
    )
    return this
  }

  /** Fade it out. A tour that ends with a pointer still on screen looks cut. */
  leave(duration = 0.35) {
    this.clock += duration
    this.write(
      { pose: { x: this.pose.x, y: this.pose.y, opacity: 0, scale: 1 } },
      easeInOutCubic,
    )
    return this
  }

  wait(seconds: number) {
    this.clock += seconds
    this.write({}, hold)
    return this
  }

  moveTo(id: string, options: { duration?: number; ease?: Easing } = {}) {
    const target = this.centre(id)
    if (!target) return this

    const distance = Math.hypot(target.x - this.pose.x, target.y - this.pose.y)
    const duration =
      options.duration ??
      clamp(MIN_TRAVEL, distance / this.speed, MAX_TRAVEL)

    this.clock += duration
    this.write(
      { pose: { ...target, opacity: 1, scale: 1 } },
      options.ease ?? easeInOutCubic,
    )
    return this
  }

  /**
   * Press and release.
   *
   * The press takes 40% of the duration and squashes to 0.86; the release
   * returns to 1 on `easeOutBack` so it overshoots a little and settles. Those
   * three numbers are the entire difference between "a click happened" and "an
   * element changed size", so they are not worth re-tuning per reel.
   */
  click(options: { duration?: number } = {}) {
    const { duration = 0.22 } = options
    const press = duration * 0.4
    const at = { x: this.pose.x, y: this.pose.y, opacity: 1 }

    this.clock += press
    this.write({ pose: { ...at, scale: 0.86 } }, easeInOutCubic)

    this.clock += duration - press
    this.write({ pose: { ...at, scale: 1 } }, easeOutBack)
    this.clicks.push(this.clock)
    return this
  }

  /** Centre the camera on a region. */
  zoomTo(id: string, options: { z?: number; duration?: number } = {}) {
    const centre = this.centre(id)
    if (!centre) return this

    const { duration = 0.9, z = 1.8 } = options
    this.clock += duration
    this.write({ cam: { ...centre, z } }, easeInOutCubic)
    return this
  }

  zoomOut(options: { duration?: number } = {}) {
    const { duration = 0.9 } = options
    this.clock += duration
    this.write(
      {
        cam: {
          x: this.source.width / 2,
          y: this.source.height / 2,
          z: 1,
        },
      },
      easeInOutCubic,
    )
    return this
  }

  build(): Tour {
    return {
      cam: this.camKeys,
      clicks: this.clicks,
      duration: this.clock,
      pose: this.poseKeys,
      source: this.source,
    }
  }
}

/**
 * Compile a tour.
 *
 *     const TOUR = tour(SHOT, REGIONS, (s) =>
 *       s.parkAt("attempts").enter().wait(0.4)
 *        .moveTo("save").click().wait(0.8).leave(),
 *     )
 */
export function tour(
  source: { width: number; height: number },
  regions: Regions,
  script: (builder: TourBuilder) => void,
): Tour {
  const builder = new TourBuilder(regions, source)
  script(builder)
  return builder.build()
}

export function poseAt(current: Tour, seconds: number): Pose {
  return sample(current.pose, seconds, mixPose)
}

/**
 * The camera as a rect, so `<Shot>` can frame it directly.
 *
 * The shot's container always matches the source's aspect ratio, so a zoom is
 * a straight divide on both axes — no letterboxing to reason about.
 */
export function camRectAt(current: Tour, seconds: number): Rect {
  const cam = sample(current.cam, seconds, mixCam)
  const width = current.source.width / cam.z
  const height = current.source.height / cam.z

  return { x: cam.x - width / 2, y: cam.y - height / 2, width, height }
}

/** Seconds since the most recent click, or null if none has landed yet. */
export function sinceClick(current: Tour, seconds: number): number | null {
  let last: number | null = null
  for (const t of current.clicks) {
    if (t > seconds) break
    last = t
  }
  return last === null ? null : seconds - last
}
