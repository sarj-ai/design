/**
 * The sphere on `/design-system` — geometry and timing, with no React in it.
 *
 * Nodes sit on a **Fibonacci sphere** and the whole sphere is turned by a
 * **quaternion**, not by two Euler angles. That choice is the difference
 * between a globe and a carousel: with pitch and yaw kept as separate numbers,
 * dragging sideways after dragging up turns the sphere about the wrong axis,
 * because "sideways" is still measured against the world while the sphere has
 * already tilted. Pre-multiplying a fresh axis-angle rotation onto the
 * accumulated one applies each drag in the viewer's frame instead, so a
 * horizontal drag always spins it horizontally whatever came before, and there
 * is no gimbal lock at the poles.
 *
 * Each node is then projected through a real perspective divide, so one on the
 * near face is genuinely larger than one on the far face. The nodes themselves
 * are ordinary DOM and are never rotated — they always face the viewer, which
 * is what keeps their text readable at every angle.
 *
 * `three` would supply `Quaternion` and `Vector3`, but it is not a dependency
 * here, and adding it for two small classes would also add it to the npm
 * dependencies of every registry item that reaches this file. The formulae
 * below are the standard ones.
 */

export type Vec3 = { x: number; y: number; z: number }

/** `w` is the scalar part. */
export type Quat = { w: number; x: number; y: number; z: number }

export const IDENTITY: Quat = { w: 1, x: 0, y: 0, z: 0 }

/**
 * `count` points spread evenly over the unit sphere.
 *
 * The golden-angle spiral, which is the usual answer to "put N points on a
 * sphere without them clumping". A latitude/longitude grid crowds hard at the
 * poles, and the crowding is obvious the moment the sphere turns.
 */
export function fibonacciSphere(count: number): Vec3[] {
  if (count <= 0) return []

  const golden = Math.PI * (3 - Math.sqrt(5))

  return Array.from({ length: count }, (_, index) => {
    const y = (index * 2) / count - 1 + 1 / count
    const ring = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * index

    return { x: Math.cos(theta) * ring, y, z: Math.sin(theta) * ring }
  })
}

/** A rotation of `angle` radians about `axis`, which must be unit length. */
export function fromAxisAngle(axis: Vec3, angle: number): Quat {
  const half = angle / 2
  const sin = Math.sin(half)

  return { w: Math.cos(half), x: axis.x * sin, y: axis.y * sin, z: axis.z * sin }
}

/** `a * b` — the rotation `b`, then the rotation `a`. */
export function multiply(a: Quat, b: Quat): Quat {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  }
}

/**
 * Scale back to unit length.
 *
 * Every frame, because each drag multiplies another quaternion in and the
 * rounding error in those products compounds until the sphere visibly shears.
 */
export function normalize(q: Quat): Quat {
  const length = Math.hypot(q.w, q.x, q.y, q.z)
  if (length === 0) return IDENTITY

  return { w: q.w / length, x: q.x / length, y: q.y / length, z: q.z / length }
}

/** Turn `v` by `q`. */
export function rotate(v: Vec3, q: Quat): Vec3 {
  /* q * v * q⁻¹, with the conjugate folded in rather than built separately. */
  const ix = q.w * v.x + q.y * v.z - q.z * v.y
  const iy = q.w * v.y + q.z * v.x - q.x * v.z
  const iz = q.w * v.z + q.x * v.y - q.y * v.x
  const iw = -q.x * v.x - q.y * v.y - q.z * v.z

  return {
    x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
  }
}

/** The world axes a drag turns the sphere about. */
export const Y_AXIS: Vec3 = { x: 0, y: 1, z: 0 }
export const X_AXIS: Vec3 = { x: 1, y: 0, z: 0 }

/**
 * The idle axis, tilted 23° off vertical.
 *
 * A sphere turning about a perfectly upright axis reads as a machine. Tilting
 * it means the nodes trace visibly different paths across a turn, which is what
 * makes the motion look like it has a shape rather than a period.
 */
export const AUTO_AXIS: Vec3 = {
  x: Math.sin((23 * Math.PI) / 180),
  y: Math.cos((23 * Math.PI) / 180),
  z: 0,
}

/** Radians per 16ms step while idle. */
export const AUTO_SPEED = 0.001

/** Angular impulse per pixel of drag. */
export const DRAG_SPEED = 0.001

/** What one arrow-key press adds, in radians. */
export const KEY_STEP = 0.3

/** Speed kept per 16ms step once the drag ends. */
export const FRICTION = 0.94

/** How fast the drawn angle chases the target angle, per 16ms step. */
export const SMOOTHING = 0.11

/** How fast the sphere grows out of the centre on arrival, per 16ms step. */
export const REVEAL_RATE = 0.9

/** Below this the coast has stopped and the loop can idle. */
export const MOTION_FLOOR = 0.00001

/** Pixels of pointer travel past which a press was a drag, not a click. */
export const TAP_SLOP = 6

/** How long the doc panel takes to climb from the bottom edge. */
export const ENTER_DURATION = 460

/** How far a node at the far pole is faded back. */
const DEPTH_FADE = 0.3

export type Projected = {
  /** Screen offset from the centre of the stage, in pixels. */
  x: number
  y: number
  /** Perspective scale: above 1 on the near face, below it on the far. */
  scale: number
  opacity: number
  /** Paint order, so the near face covers the far one. */
  z: number
}

/**
 * The camera's focal length for a stage this tall — a 60° vertical field.
 *
 * Derived from the height rather than fixed, so the amount of perspective looks
 * the same on a laptop and on a tall monitor. A fixed focal length makes a
 * short window look flat and a tall one look like a fisheye.
 */
export function perspectiveFor(height: number): number {
  return height / (2 * Math.tan(Math.PI / 6))
}

/**
 * The sphere's radius for a stage this size.
 *
 * Well under half the stage on purpose. A node's distance from the centre is
 * the radius times its perspective scale, and the near face scales up — so a
 * radius sized to the stage puts the closest nodes, the large ones, off the
 * bottom of it.
 */
export function sphereRadius(width: number, height: number): number {
  return Math.max(110, Math.min(width, height) * 0.26)
}

/**
 * Where a unit-sphere point lands on screen once turned and projected.
 *
 * `reveal` runs 0 to 1 and scales the radius, so the whole sphere grows out of
 * one point at the centre — that is the entrance, and the same number fades the
 * nodes in as they travel out.
 */
export function project(
  point: Vec3,
  rotation: Quat,
  radius: number,
  perspective: number,
  reveal: number,
): Projected {
  const spread = radius * reveal
  const turned = rotate(
    { x: point.x * spread, y: point.y * spread, z: point.z * spread },
    rotation,
  )

  /* The perspective divide. Guarded because a node landing exactly on the
     camera plane would divide by zero and fling itself off the stage. */
  const scale = perspective / Math.max(1, perspective - turned.z)

  /* A depth fade on top of the perspective scale. The scale alone leaves
     far-face text at full strength behind near-face text, and two labels of
     equal weight overlapping is the one thing that makes a sphere of words
     unreadable. */
  const depth = (turned.z / (radius || 1) + 1) / 2

  return {
    opacity: reveal * (DEPTH_FADE + depth * (1 - DEPTH_FADE)),
    scale,
    x: turned.x * scale,
    /* Screen y grows downward, sphere y grows upward. */
    y: -turned.y * scale,
    z: Math.round(turned.z),
  }
}
