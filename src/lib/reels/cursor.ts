import {
  easeInOutCubic,
  easeOutBack,
  type Easing,
  type Rect,
} from "@/lib/reels/anim"

export type Pose = { x: number; y: number; scale: number; opacity: number }

export type Cam = { x: number; y: number; z: number }

type Regions = Record<string, Rect>

type Key<T> = { t: number; value: T; ease: Easing }
type Track<T> = Key<T>[]

export type Tour = {
  /** Seconds. */
  duration: number
  pose: Track<Pose>
  cam: Track<Cam>
  clicks: number[]
  source: { width: number; height: number }
}

// Every verb writes a key to every track so they stay time-aligned; tracks it did not touch
// get `hold` so they do not drift toward their next key.
const hold: Easing = () => 0

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (lo: number, v: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

// A fraction of the screenshot width, so 1x and 2x captures move at the same speed.
const CROSS_SCREEN_SECONDS = 1.75
const MIN_TRAVEL = 0.4
const MAX_TRAVEL = 1.6

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

// The easing belongs to the destination keyframe: segment i..i+1 uses `track[i + 1].ease`.
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
    this.pose = {
      x: source.width / 2,
      y: source.height / 2,
      opacity: 0,
      scale: 1,
    }
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

  parkAt(id: string) {
    const at = this.centre(id) ?? { x: this.pose.x, y: this.pose.y }
    this.write({ pose: { ...at, opacity: 0, scale: 1 } }, hold)
    return this
  }

  enter(duration = 0.45) {
    this.clock += duration
    this.write(
      { pose: { x: this.pose.x, y: this.pose.y, opacity: 1, scale: 1 } },
      easeInOutCubic,
    )
    return this
  }

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
      options.duration ?? clamp(MIN_TRAVEL, distance / this.speed, MAX_TRAVEL)

    this.clock += duration
    this.write(
      { pose: { ...target, opacity: 1, scale: 1 } },
      options.ease ?? easeInOutCubic,
    )
    return this
  }

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

// Assumes the container matches the source aspect ratio, so a zoom is a straight divide.
export function camRectAt(current: Tour, seconds: number): Rect {
  const cam = sample(current.cam, seconds, mixCam)
  const width = current.source.width / cam.z
  const height = current.source.height / cam.z

  return { x: cam.x - width / 2, y: cam.y - height / 2, width, height }
}

export function sinceClick(current: Tour, seconds: number): number | null {
  let last: number | null = null
  for (const t of current.clicks) {
    if (t > seconds) break
    last = t
  }
  return last === null ? null : seconds - last
}
