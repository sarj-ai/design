import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

const CX = 270
const R = 170
const RY = 46
const SQUASH = RY / R
const LAYERS = [90, 225, 360]

const LX = 720
const LY = 230

/* Mirrors the shader's constants in orb-avatar.tsx. */
const CELLS = 9
const LENS = 0.6

function at(x: number, y: number, cy: number) {
  return `${(CX + x).toFixed(1)} ${(cy + y * SQUASH).toFixed(1)}`
}

function lattice(cy: number) {
  const step = (2 * R) / CELLS
  const s = Math.SQRT1_2
  const lines: string[] = []
  for (let n = -Math.floor(CELLS / 2); n <= Math.floor(CELLS / 2); n++) {
    const c = n * step
    if (Math.abs(c) >= R) continue
    const t = Math.sqrt(R * R - c * c)
    lines.push(
      `M${at(c * s + t * s, c * s - t * s, cy)}L${at(c * s - t * s, c * s + t * s, cy)}`,
      `M${at(c * s + t * s, -c * s + t * s, cy)}L${at(c * s - t * s, -c * s - t * s, cy)}`,
    )
  }
  return lines.join("")
}

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

/* The shader samples centre − 0.6 × offset, so rays cross at the lens and land mirrored. */
const D = 60
const TOP = 125
const BOTTOM = 335
const RAYS = [-1, 0, 1].map((k) => ({
  from: LX - k * D * LENS,
  to: LX + k * D,
}))
const FOCUS = TOP + ((BOTTOM - TOP) * LENS) / (1 + LENS)

function dimension(x1: number, x2: number, y: number) {
  return (
    `M${x1} ${y}H${x2}` +
    `M${x1} ${y - 10}v20M${x2} ${y - 10}v20` +
    `M${x1 + 10} ${y - 8}l-10 8 10 8M${x2 - 10} ${y - 8}l10 8-10 8`
  )
}

export function OrbAnatomy({ className }: FigureProps) {
  const [light, lenses, disc] = LAYERS
  const bEnd = end(bright, light)
  const dEnd = end(deep, light)

  return (
    <Figure className={className} viewBox="0 0 960 460">
      <g {...LINE}>
        <path
          d={`M${CX} 0v460M${CX - R} 0v460M${CX + R} 0v460`}
          opacity=".5"
          strokeDasharray="4 8"
        />

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

        <ellipse cx={CX} cy={lenses} rx={R} ry={RY} />
        <path d={lattice(lenses)} opacity=".6" />

        <path d={dimension(CX - R, CX + R, lenses - RY - 14)} opacity=".7" />

        <ellipse cx={CX} cy={disc} rx={R} ry={RY} />
        <path d={lattice(disc)} opacity=".35" />

        <circle cx={CX + 108} cy={lenses} opacity=".7" r="16" />
        <path d={`M${CX + 124} ${lenses}H${LX - 150}`} opacity=".5" />

        <circle cx={LX} cy={LY} r="150" />

        <path d={`M${LX - 110} ${TOP}H${LX + 110}`} opacity=".6" />
        <path d={`M${LX - 110} ${BOTTOM}H${LX + 110}`} opacity=".6" />

        <path
          d={`M${LX - 90} ${FOCUS}Q${LX} ${FOCUS - 40} ${LX + 90} ${FOCUS}Q${LX} ${FOCUS + 40} ${LX - 90} ${FOCUS}Z`}
        />

        {RAYS.map(({ from, to }) => (
          <path d={`M${from} ${TOP}L${to} ${BOTTOM}`} key={from} opacity=".7" />
        ))}

        <path d={dimension(LX, LX + D * LENS, TOP - 20)} opacity=".7" />
        <path d={dimension(LX - D, LX, BOTTOM + 20)} opacity=".7" />
      </g>

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
