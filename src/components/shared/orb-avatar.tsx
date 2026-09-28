"use client"

import { useEffect, useRef } from "react"

import { TONES, type OrbTone } from "@/components/shared/orb-tones"
import { Avatar } from "@/components/ui/avatar"

/**
 * A disc of liquid light that stands in for someone with no photo.
 *
 * Drawn by a fragment shader: a soft two-blob gradient seen through a lattice
 * of diamond lenses, each one flipping the light behind it, with a bevel and a
 * groove between cells. The blobs drift, so the light rolls through the
 * lattice. The name sets the tone and where
 * the blobs start, so the same name always gets the same orb and a list of
 * them does not repeat one picture.
 *
 * One WebGL context for every avatar on the page. Browsers cap live contexts
 * at around sixteen, so a context per avatar breaks a list of forty. Instead
 * a single offscreen canvas draws each visible avatar in turn, every frame,
 * at that avatar's own pixel size, and copies the frame into the avatar's 2D
 * canvas. Off-screen avatars are skipped, and under reduced motion each one
 * is drawn once and left still.
 *
 * The colours are read from the live tokens, not written here, so the orbs
 * follow a brand or whitelabel change.
 */

type Rgb = [number, number, number]

/* How far toward white the body and the light sit, for a one-token tone. */
const BODY = 0.4
const LIGHT = 0.75

function toward(rgb: Rgb, amount: number): Rgb {
  return rgb.map((c) => c + (1 - c) * amount) as Rgb
}

function toneRgb(tone: OrbTone): Rgb[] {
  const stops: readonly string[] = TONES[tone]
  const [deep, body, light] = stops.map(classRgb)
  return [deep, body ?? toward(deep, BODY), light ?? toward(deep, LIGHT)]
}

const VERTEX = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uSeed;
uniform float uTime;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;

/* How many cells run across the disc: fine enough to read as a texture, and
   still about five device pixels a cell on a 24px avatar. */
const float CELLS = 9.0;

/* How strongly each cell flips and magnifies the light behind it. */
const float LENS = 0.6;

/* The light: one bright blob and one deep one, drifting on their own slow
   orbits. The seed sets where each starts, so every name is at a different
   point on the same loop. */
float field(vec2 p) {
  vec2 bright = vec2(cos(uSeed + uTime * 0.7), sin(uSeed * 1.3 + uTime * 0.5)) * 0.55;
  vec2 deep = vec2(cos(uSeed + 2.6 - uTime * 0.4), sin(uSeed * 0.7 + 2.6 + uTime * 0.6)) * 0.45;
  float f = 0.5
    + 0.7 * smoothstep(1.6, 0.0, length(p - bright))
    - 0.6 * smoothstep(1.2, 0.0, length(p - deep));
  return clamp(f, 0.0, 1.0);
}

vec3 ramp(float f) {
  vec3 col = mix(uA, uB, smoothstep(0.0, 0.55, f));
  return mix(col, uC, smoothstep(0.45, 1.0, f));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  float mask = 1.0 - smoothstep(1.0 - 4.0 / uRes.y, 1.0, length(uv));
  if (mask <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  /* A square grid turned 45 degrees, so the cells are diamonds and the
     lines between them run on the diagonals. */
  mat2 turn = mat2(0.7071, -0.7071, 0.7071, 0.7071);
  mat2 back = mat2(0.7071, 0.7071, -0.7071, 0.7071);
  vec2 g = turn * uv * CELLS * 0.5;
  vec2 cell = fract(g) - 0.5;

  /* Each cell is a lens: it shows the light behind its own centre, flipped
     and magnified, which is what makes the lattice read as liquid glass
     rather than a pattern printed on top. */
  vec2 offset = back * cell * (2.0 / CELLS);
  float f = field(uv - offset * (1.0 + LENS));
  vec3 col = ramp(f);

  /* The bevel: each diamond catches light on its upper-left faces and falls
     into shade on the lower-right, strongest at the rim. */
  float d = max(abs(cell.x), abs(cell.y));
  vec2 face = back * (abs(cell.x) > abs(cell.y) ? vec2(sign(cell.x), 0.0) : vec2(0.0, sign(cell.y)));
  float lit = dot(face, vec2(-0.7071, 0.7071));
  col += smoothstep(0.2, 0.5, d) * lit * 0.08;

  /* The groove between cells, drawn a step deeper on the ramp than the
     light it runs through, so it shows on the pale side and sinks on the
     deep side the way a real channel would. */
  float aa = 1.5 * CELLS / uRes.y;
  float groove = smoothstep(0.5 - 2.5 * aa, 0.5, d);
  col = mix(col, ramp(f * 0.7), groove * 0.55);

  gl_FragColor = vec4(col * mask, mask);
}
`

type Renderer = {
  gl: WebGLRenderingContext
  uniforms: Record<
    "res" | "seed" | "time" | "a" | "b" | "c",
    WebGLUniformLocation | null
  >
}

let renderer: Renderer | null | undefined

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

function getRenderer(): Renderer | null {
  if (renderer !== undefined) return renderer
  renderer = null

  const gl = document.createElement("canvas").getContext("webgl", {
    premultipliedAlpha: true,
  })
  if (!gl) return null

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  /* One triangle that covers the whole viewport. */
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  )
  const position = gl.getAttribLocation(program, "p")
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  renderer = {
    gl,
    uniforms: {
      res: gl.getUniformLocation(program, "uRes"),
      seed: gl.getUniformLocation(program, "uSeed"),
      time: gl.getUniformLocation(program, "uTime"),
      a: gl.getUniformLocation(program, "uA"),
      b: gl.getUniformLocation(program, "uB"),
      c: gl.getUniformLocation(program, "uC"),
    },
  }
  return renderer
}

/* A colour class as 0–1 RGB. A hidden element wearing the class gives the
   resolved colour, which may be oklch or lab, and a 2D canvas turns any CSS
   colour into sRGB pixels. */
let probe: CanvasRenderingContext2D | null = null

function classRgb(className: string): Rgb {
  probe ??= document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true })
  if (!probe) return [0.5, 0.5, 0.5]

  const swatch = document.createElement("span")
  swatch.className = `${className} hidden`
  document.body.append(swatch)
  const value = getComputedStyle(swatch).backgroundColor
  swatch.remove()

  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = value
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255]
}

function hash(value: string) {
  let h = 2166136261
  for (const char of value)
    h = Math.imul(h ^ char.charCodeAt(0), 16777619) >>> 0
  return h
}

type Orb = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  seed: number
  colours: [number, number, number][]
  visible: boolean
}

const orbs = new Set<Orb>()
let frame = 0
const start = typeof performance === "undefined" ? 0 : performance.now()

/* Seconds of drift per real second. Slow: an avatar sits beside text someone
   is reading, and it should never pull the eye off it. */
const SPEED = 0.35

function paint(orb: Orb, time: number) {
  const r = getRenderer()
  if (!r) return
  const { gl, uniforms } = r
  const { width, height } = orb.canvas
  if (!width || !height) return

  const glCanvas = gl.canvas as HTMLCanvasElement
  if (glCanvas.width < width || glCanvas.height < height) {
    glCanvas.width = Math.max(glCanvas.width, width)
    glCanvas.height = Math.max(glCanvas.height, height)
  }

  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.uniform2f(uniforms.res, width, height)
  gl.uniform1f(uniforms.seed, orb.seed)
  gl.uniform1f(uniforms.time, time)
  gl.uniform3fv(uniforms.a, orb.colours[0])
  gl.uniform3fv(uniforms.b, orb.colours[1])
  gl.uniform3fv(uniforms.c, orb.colours[2])
  gl.drawArrays(gl.TRIANGLES, 0, 3)

  /* The viewport sits at the bottom of the GL canvas, which may be taller
     than this avatar, so copy from that corner. */
  orb.context.clearRect(0, 0, width, height)
  orb.context.drawImage(
    glCanvas,
    0,
    glCanvas.height - height,
    width,
    height,
    0,
    0,
    width,
    height,
  )
}

function tick(now: number) {
  const time = ((now - start) / 1000) * SPEED
  for (const orb of orbs) if (orb.visible) paint(orb, time)
  frame = orbs.size ? requestAnimationFrame(tick) : 0
}

export type OrbAvatarProps = React.ComponentProps<typeof Avatar> & {
  /** Who it stands for. Read out to screen readers and used as the seed. */
  name: string
  tone?: OrbTone
}

export function OrbAvatar({
  name,
  tone = "violet",
  children,
  ...props
}: OrbAvatarProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    /* Drawn at the avatar's real size in device pixels — no bigger, so a
       24px avatar costs a 48px draw on a retina screen. */
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.round(canvas.clientWidth * ratio)
    canvas.height = Math.round(canvas.clientHeight * ratio)

    const h = hash(name)
    const orb: Orb = {
      canvas,
      context,
      seed: ((h >>> 4) % 997) / 7,
      colours: toneRgb(tone),
      visible: true,
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(orb, 0)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      orb.visible = entry.isIntersecting
    })
    observer.observe(canvas)

    orbs.add(orb)
    frame ||= requestAnimationFrame(tick)

    return () => {
      observer.disconnect()
      orbs.delete(orb)
      if (!orbs.size) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }
  }, [name, tone])

  return (
    <Avatar {...props}>
      <canvas
        aria-label={name}
        className="size-full rounded-full"
        ref={ref}
        role="img"
      />
      {/* An AvatarBadge, as on any shadcn avatar. */}
      {children}
    </Avatar>
  )
}
