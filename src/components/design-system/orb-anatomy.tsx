import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

/* The stack: three layers of the disc, exploded along one axis and seen from
   above at an angle, so each circle lands as an ellipse. */
const CX = 270
const R = 170
const RY = 46
const SQUASH = RY / R
const LAYERS = [90, 225, 360]

/* The inset: one lens cut through, magnified. */
const LX = 720
const LY = 230

/* Mirrors the shader's constants in orb-avatar.tsx. */
const CELLS = 9
const LENS = 0.6

/** A point in the disc's own coordinates (radius R), placed on a layer. */
function at(x: number, y: number, cy: number) {
  return `${(CX + x).toFixed(1)} ${(cy + y * SQUASH).toFixed(1)}`
}

/**
 * The lattice as the shader cuts it: a square grid turned 45 degrees, one
 * line at every whole cell, so CELLS cells run across the diameter. Each line
 * is clipped to the disc analytically — no clip path to keep unique.
 */
function lattice(cy: number) {
  const step = (2 * R) / CELLS
  const s = Math.SQRT1_2
  const lines: string[] = []
  for (let n = -Math.floor(CELLS / 2); n <= Math.floor(CELLS / 2); n++) {
    const c = n * step
    if (Math.abs(c) >= R) continue
    const t = Math.sqrt(R * R - c * c)
    /* (x + y) / √2 = c, then (x − y) / √2 = c. */
    lines.push(
      `M${at(c * s + t * s, c * s - t * s, cy)}L${at(c * s - t * s, c * s + t * s, cy)}`,
      `M${at(c * s + t * s, -c * s + t * s, cy)}L${at(c * s - t * s, -c * s - t * s, cy)}`,
    )
  }
  return lines.join("")
}

/**
 * A stretch of one blob's path, sampled from the shader's own formula at seed
 * 0. The two frequencies differ, so the path is a Lissajous figure rather
 * than a circle — the drift never quite repeats inside an avatar's lifetime.
 */
function trail(
  fx: (t: number) => number,
  fy: (t: number) => number,
  radius: number,
  cy: number,
  to: number,
) {
  const points: string[] = []
  for (let t = 0; t <= to; t += 0.1)
    points.push(at(fx(t) * radius * R, -fy(t) * radius * R, cy))
  return `M${points.join("L")}`
}

const bright = {
  x: (t: number) => Math.cos(0.7 * t),
  y: (t: number) => Math.sin(0.5 * t),
  radius: 0.55,
}
const deep = {
  x: (t: number) => Math.cos(2.6 - 0.4 * t),
  y: (t: number) => Math.sin(2.6 + 0.6 * t),
  radius: 0.45,
}
const TRAIL = 5

function end(blob: typeof bright, cy: number) {
  const [x, y] = at(
    blob.x(TRAIL) * blob.radius * R,
    -blob.y(TRAIL) * blob.radius * R,
    cy,
  ).split(" ")
  return { cx: x, cy: y }
}

/* The ray diagram. A pixel `d` from its cell's centre shows the light from
   `LENS * d` on the other side — the shader samples centre − 0.6 × offset —
   so rays cross at the lens and land spread and mirrored. */
const D = 60
const TOP = 125
const BOTTOM = 335
const RAYS = [-1, 0, 1].map((k) => ({
  from: LX - k * D * LENS,
  to: LX + k * D,
}))
/* Where the straight rays cross, which is where the lens sits. */
const FOCUS = TOP + ((BOTTOM - TOP) * LENS) / (1 + LENS)

/** A dimension line: the rule, a tick at each end, a chevron at each tick. */
function dimension(x1: number, x2: number, y: number) {
  return (
    `M${x1} ${y}H${x2}` +
    `M${x1} ${y - 10}v20M${x2} ${y - 10}v20` +
    `M${x1 + 10} ${y - 8}l-10 8 10 8M${x2 - 10} ${y - 8}l10 8-10 8`
  )
}

/**
 * How the orb is made: the light, the lenses and the disc they make, with one
 * lens cut open to show what it does to the light behind it.
 *
 * Every value is the shader's: CELLS 9 across the diameter, the grid at 45°,
 * LENS 0.6, and each blob's path drawn from its real formula.
 */
export function OrbAnatomy({ className }: FigureProps) {
  const [light, lenses, disc] = LAYERS
  const bEnd = end(bright, light)
  const dEnd = end(deep, light)

  return (
    <Figure className={className} viewBox="0 0 960 460">
      <g {...LINE}>
        {/* The explode axis through every centre, and the rims carried from
            layer to layer. */}
        <path
          d={`M${CX} 0v460M${CX - R} 0v460M${CX + R} 0v460`}
          opacity=".5"
          strokeDasharray="4 8"
        />

        {/* Light: the disc's outline and the two blobs' paths — bright
            solid, deep a step back — each ending at the blob. */}
        <ellipse cx={CX} cy={light} rx={R} ry={RY} />
        <path
          d={trail(bright.x, bright.y, bright.radius, light, TRAIL)}
          opacity=".7"
        />
        <path
          d={trail(deep.x, deep.y, deep.radius, light, TRAIL)}
          opacity=".5"
          strokeDasharray="4 8"
        />

        {/* Lenses: the 45° lattice, clipped to the disc. */}
        <ellipse cx={CX} cy={lenses} rx={R} ry={RY} />
        <path d={lattice(lenses)} opacity=".6" />

        {/* 9 cells, measured across the diameter it is counted over. */}
        <path d={dimension(CX - R, CX + R, lenses - RY - 14)} opacity=".7" />

        {/* Disc: the two layers composed, and the edge the mask draws. */}
        <ellipse cx={CX} cy={disc} rx={R} ry={RY} />
        <path d={lattice(disc)} opacity=".35" />

        {/* The lens picked out on the lattice, and the leader to its
            section. */}
        <circle cx={CX + 108} cy={lenses} opacity=".7" r="16" />
        <path d={`M${CX + 124} ${lenses}H${LX - 150}`} opacity=".5" />

        {/* The inset: a magnifier over one lens. */}
        <circle cx={LX} cy={LY} r="150" />

        {/* The light plane above, the sample plane below. */}
        <path d={`M${LX - 110} ${TOP}H${LX + 110}`} opacity=".6" />
        <path d={`M${LX - 110} ${BOTTOM}H${LX + 110}`} opacity=".6" />

        {/* The lens itself, in section. */}
        <path
          d={`M${LX - 90} ${FOCUS}Q${LX} ${FOCUS - 40} ${LX + 90} ${FOCUS}Q${LX} ${FOCUS + 40} ${LX - 90} ${FOCUS}Z`}
        />

        {/* Three rays, crossing at the lens and landing mirrored. */}
        {RAYS.map(({ from, to }) => (
          <path d={`M${from} ${TOP}L${to} ${BOTTOM}`} key={from} opacity=".7" />
        ))}

        {/* 0.6d on the light plane, d on the sample plane. */}
        <path d={dimension(LX, LX + D * LENS, TOP - 20)} opacity=".7" />
        <path d={dimension(LX - D, LX, BOTTOM + 20)} opacity=".7" />
      </g>

      {/* Where each blob is now. */}
      <circle cx={bEnd.cx} cy={bEnd.cy} fill="currentColor" r="5" />
      <circle
        cx={dEnd.cx}
        cy={dEnd.cy}
        fill="currentColor"
        opacity=".6"
        r="5"
      />

      <g className="text-xs" fill="currentColor">
        <text x="24" y={light + 4}>
          light
        </text>
        <text x="24" y={lenses + 4}>
          lenses
        </text>
        <text x="24" y={disc + 4}>
          disc
        </text>
        <text textAnchor="middle" x={CX} y={lenses - RY - 22}>
          {CELLS} cells
        </text>
        <text textAnchor="middle" x={LX + (D * LENS) / 2} y={TOP - 36}>
          {LENS}d
        </text>
        <text textAnchor="middle" x={LX - D / 2} y={BOTTOM + 48}>
          d
        </text>
        <text x={LX + 100} y={FOCUS + 4}>
          lens {LENS}
        </text>
      </g>
    </Figure>
  )
}
