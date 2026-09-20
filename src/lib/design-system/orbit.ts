/**
 * The orbit diagram on `/design-system` — geometry and timing, no React in it.
 *
 * A hub with a set of ellipses drawn through it, labels sitting on the curves,
 * and dots travelling round them. Every ellipse shares the hub as its centre
 * and differs only in width, height and tilt, which is what produces the
 * lens pattern: a wide flat ellipse reads as a long orbit, and the same ellipse
 * turned forty degrees reads as a pair of lines crossing the middle. The
 * "spokes" in a figure like this are not spokes — they are the narrow orbits
 * seen almost edge-on.
 *
 * Positions are computed in a unit space where 1 is the figure's half-width,
 * then multiplied by a radius the stage decides. Keeping the shape independent
 * of the pixel size is what lets the same figure be right on a laptop and on a
 * wide monitor without a second set of numbers.
 */

/** One ellipse through the hub. `rx`/`ry` are fractions of the figure radius. */
export type Ring = { rx: number; ry: number; rotate: number }

/**
 * The orbits, widest first.
 *
 * Four increasingly narrow upright ellipses give the nested-lens core; the two
 * tilted flat ones give the long diagonals that read as spokes. Tilts are not
 * mirror images of each other on purpose — a figure whose every curve has an
 * exact opposite reads as a logo, and this one wants to read as a diagram.
 */
export const RINGS: Ring[] = [
  { rotate: 0, rx: 1, ry: 0.46 },
  { rotate: 0, rx: 0.72, ry: 0.5 },
  { rotate: 0, rx: 0.34, ry: 0.52 },
  { rotate: 0, rx: 0.13, ry: 0.5 },
  { rotate: 27, rx: 0.94, ry: 0.2 },
  { rotate: -34, rx: 0.88, ry: 0.16 },
]

/**
 * The cube at the centre, as a fraction of the figure radius.
 *
 * Half-extent, so the cube spans twice this before projection and rather more
 * than that when a corner swings towards the viewer. Comfortably larger than
 * the flat disc it replaced, which at 0.075 read as a dot the orbits happened
 * to cross rather than as the thing they go round.
 */
export const CUBE = 0.15

/** Turns per second. Slow — it is a centre of gravity, not a spinner. */
export const CUBE_SPIN = 0.055

/**
 * The isometric elevation, `atan(1/√2)` ≈ 35.26°.
 *
 * The one angle at which a cube's three visible faces project to equal areas,
 * which is what makes a drawing read as isometric rather than as an arbitrary
 * perspective. Fixed, while the cube turns about its vertical axis underneath
 * it — so every frame is a true isometric view of a rotating cube, instead of
 * a cube tumbling through angles that are not isometric at all.
 */
export const ISO_TILT = Math.atan(1 / Math.SQRT2)

export type Vec3 = { x: number; y: number; z: number }

/** The eight corners of a cube of half-extent 1. */
export const CUBE_CORNERS: Vec3[] = [
  { x: -1, y: -1, z: -1 },
  { x: 1, y: -1, z: -1 },
  { x: 1, y: 1, z: -1 },
  { x: -1, y: 1, z: -1 },
  { x: -1, y: -1, z: 1 },
  { x: 1, y: -1, z: 1 },
  { x: 1, y: 1, z: 1 },
  { x: -1, y: 1, z: 1 },
]

/** The twelve edges: the back face, the front face, and the four struts. */
export const CUBE_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
]

/**
 * A corner, turned about the vertical axis and projected isometrically.
 *
 * Orthographic, not perspective: parallel edges stay parallel, which is the
 * whole character of an isometric drawing. A perspective divide here would
 * make the near corner flare and the cube would read as a photograph of a box
 * rather than as a diagram of one.
 *
 * `depth` comes back so the caller can fade the far edges. Twelve identical
 * lines are a Necker cube — genuinely ambiguous about which face is front, and
 * the eye keeps flipping it. A little less ink on the far edges settles it
 * without adding anything that is not black, white or grey.
 */
export function isoProject(
  corner: Vec3,
  spin: number,
): { x: number; y: number; depth: number } {
  const sin = Math.sin(spin)
  const cos = Math.cos(spin)

  /* About Y — the turn. */
  const x = corner.x * cos + corner.z * sin
  const z = corner.z * cos - corner.x * sin

  /* About X — the fixed elevation. */
  const tiltSin = Math.sin(ISO_TILT)
  const tiltCos = Math.cos(ISO_TILT)

  return {
    /* 0 at the far corner, 1 at the near one. */
    depth: (z * tiltSin + corner.y * tiltCos + Math.SQRT2) / (2 * Math.SQRT2),
    x,
    /* Negated: screen y grows downward, the cube's y grows up. */
    y: -(corner.y * tiltCos - z * tiltSin),
  }
}

export type Point = { x: number; y: number }

/**
 * The point at parameter `t` on `ring`, in figure units.
 *
 * `t` runs 0 to 1 around the ellipse. Note this is the parametric angle, not
 * the polar one — on a flat ellipse the two diverge sharply, which is exactly
 * why dots spaced evenly in `t` bunch up at the ends of a long orbit and spread
 * out across its middle. That is the correct behaviour for something travelling
 * an orbit, so it is left alone.
 */
export function ringPoint(ring: Ring, t: number): Point {
  const angle = t * Math.PI * 2
  const tilt = (ring.rotate * Math.PI) / 180
  const x = ring.rx * Math.cos(angle)
  const y = ring.ry * Math.sin(angle)

  return {
    x: x * Math.cos(tilt) - y * Math.sin(tilt),
    y: x * Math.sin(tilt) + y * Math.cos(tilt),
  }
}

/** Where one label sits: which orbit, and how far round it. */
export type Placement = { ring: number; t: number }

/** How far above and below the hub the outermost label sits, in radians. */
const FAN = Math.PI / 3

/**
 * Which orbit a label sits on, by how far it is from the hub's own level.
 *
 * Read left to right: a label level with the hub takes the narrow orbit, and
 * one at the top or bottom of the fan takes the widest. That inversion is what
 * squares the figure off. Put every label on one orbit instead and the column
 * bows inward at its ends, because the far side of an ellipse curves back
 * towards the centre — the top and bottom labels end up nearer the middle than
 * the one beside them, which reads as a mistake rather than as a curve.
 *
 * Only upright orbits are listed. A label on a tilted one cannot have a mirror
 * image, and the mirroring is the point.
 */
const LADDER = [2, 1, 0]

/**
 * Labels in mirrored rows, one pair either side of the hub.
 *
 * Every row places both of its labels from a single angle: an ellipse is
 * symmetric about its own vertical axis, so the point at `t` and the point at
 * `π − t` share a `y` and differ only in the sign of their `x`. One number, two
 * labels, and they cannot drift apart.
 *
 * Rows rather than two independently fanned columns. Fanning each side on its
 * own looks identical while the count is even and falls apart the moment it is
 * not: a column of six and a column of five spread across the same arc put
 * their labels at different heights, so only the topmost and bottommost pair
 * line up and everything between them reads as scattered.
 *
 * An odd label goes under the hub on the centre line, where being unpaired is
 * the point rather than a gap. Hanging it off one side instead leaves a hole
 * opposite it, which is the same failure in a different place.
 */
export function placements(count: number): Placement[] {
  const pairs = Math.floor(count / 2)
  const wrap = (angle: number) => (((angle / (Math.PI * 2)) % 1) + 1) % 1
  const spots: Placement[] = []

  for (let row = 0; row < pairs; row += 1) {
    /* +1 at the top of the fan, -1 at the bottom, 0 level with the hub. */
    const height = pairs === 1 ? 0 : 1 - (row / (pairs - 1)) * 2

    /* Negated because y grows downward on screen: the top of the fan is a
       negative y, which is a negative sine. */
    const angle = -height * FAN

    /* A lone row takes the widest orbit rather than the narrow one the ladder
       would give it — with nothing above or below to square off against, a
       pair tucked in beside the hub just looks cramped. */
    const ring =
      pairs === 1
        ? 0
        : LADDER[Math.round(Math.abs(height) * (LADDER.length - 1))]

    spots.push({ ring, t: wrap(angle) })
    spots.push({ ring, t: wrap(Math.PI - angle) })
  }

  /* Straight down from the hub, on the tallest orbit so it clears the bottom
     row rather than landing on top of it. */
  if (count % 2 === 1) spots.push({ ring: LADDER[0], t: 0.25 })

  return spots
}

/** Dots riding each orbit, as `[ring, startingT]` pairs. */
export function dots(): { ring: number; t: number }[] {
  return RINGS.flatMap((_, ring) =>
    /* Three to an orbit, offset so they never line up into a spoke. */
    [0, 0.37, 0.71].map((t) => ({ ring, t: (t + ring * 0.13) % 1 })),
  )
}

/** Turns per second for a dot on `ring`. Outer orbits travel slower. */
export function dotSpeed(ring: number): number {
  return 0.035 / (0.6 + RINGS[ring].rx)
}

/** The figure's radius for a stage this size. */
export function figureRadius(width: number, height: number): number {
  /* Bounded by both axes: the figure is roughly twice as wide as it is tall,
     so height is the binding constraint on a short window and width on a
     narrow one. */
  return Math.max(160, Math.min(width * 0.42, height * 0.78))
}

/** Milliseconds between one label's arrival and the next. */
export const LABEL_STAGGER = 90

/** How long one label takes to arrive. */
export const LABEL_DURATION = 520

/** How long the orbits take to draw themselves in. */
export const DRAW_DURATION = 900

/** When every label of a figure this size has arrived. */
export function entranceEnd(count: number): number {
  return Math.max(
    DRAW_DURATION,
    Math.max(count - 1, 0) * LABEL_STAGGER + LABEL_DURATION,
  )
}

/**
 * How long to let the drawer stand before the route is pushed.
 *
 * Slightly past the 300ms the `drawer-up` token takes, so the panel has landed
 * rather than being swapped out mid-climb. The topic routes are prerendered, so
 * this is the whole wait — it is an affordance, not a loading screen.
 */
export const OPEN_DELAY = 340
