'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

export type MeshOrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

export type MeshOrbProps = React.ComponentProps<'div'> & {
  size?: number
  color?: string
  /** Agent state. Sets the colour and the motion; `color` overrides the hue. */
  state?: MeshOrbState
}

/**
 * The second orb, and a different answer to the same question.
 *
 * `FluidOrb` states the agent as a body of liquid: a churning fill with a
 * surface. This one states it as a mesh gradient — six colour spots drifting
 * on their own sine paths, blended by inverse distance to a high power, under
 * a warp strongest at the centre and a swirl strongest at the rim. Softer, no
 * internal edges, and it reads at a smaller size than the fluid one does.
 *
 * Both are kept because the choice between them is a look, not a bug in
 * either. Neither is the default; a screen picks one.
 *
 * The six spots are one purple ramp at three stops — deep, the state's own
 * colour, and the pale tint — not six hues. Depth is what gives a mesh
 * gradient its form, and rotating hue instead would make this the only
 * rainbow in the product.
 *
 * A state is a *motion*, the same argument `FluidOrb` makes: four purples an
 * eighth of a step apart, moving identically, is one picture with four
 * captions.
 *
 *  - `idle`      barely warps, sits near the pale end. Nothing is being asked
 *                of it.
 *  - `listening` breathes, and carries a ring running out from the middle —
 *                the one state whose job is *taking something in*.
 *  - `thinking`  the hardest churn and the deepest colour: the same volume,
 *                worked over.
 *  - `speaking`  the fastest spots and the strongest swirl, at full strength.
 *                It is putting something out.
 *
 * `color` is hex because the shader feeds `u_color` a vec3, and a WebGL
 * uniform cannot read a token class. The literals live in this file so no
 * screen has to write one — states travel by name, and `sarj/no-raw-color`
 * stays satisfied everywhere outside `components/ui`.
 *
 * Keep in step with `--primary-light`, `--primary-tint-foreground`,
 * `--primary` and `--primary-dark` in globals.css. `TINT` is `--primary-tint`.
 */
type MeshParams = {
  color: [number, number, number]
  /** How hard the centre of the disc churns. */
  warp: number
  /** How hard the swirl turns the spots around the rim. */
  swirl: number
  /** How fast the spots travel their own paths. */
  drift: number
  /** How far the blend sits from the pale end, 0 (washed out) to 1 (full). */
  depth: number
  /** The slow swell and fall of the warp. */
  pulse: number
  /** A ring running out from the middle. Listening's signature. */
  ripple: number
  /** Multiplies elapsed time, so every motion above scales together. */
  speed: number
}

const TINT = '#eeecfa'

const STATE_PARAMS: Record<
  MeshOrbState,
  Omit<MeshParams, 'color'> & { hex: string }
> = {
  idle: {
    hex: '#6d6595',
    warp: 0.16,
    swirl: 0.45,
    drift: 0.5,
    depth: 0.3,
    pulse: 0.02,
    ripple: 0,
    speed: 0.35,
  },
  listening: {
    hex: '#4d3d80',
    warp: 0.3,
    swirl: 0.7,
    drift: 0.85,
    depth: 0.55,
    pulse: 0.09,
    ripple: 0.3,
    speed: 0.9,
  },
  thinking: {
    hex: '#392868',
    warp: 0.62,
    swirl: 0.95,
    drift: 1.15,
    depth: 0.8,
    pulse: 0.015,
    ripple: 0,
    speed: 1.9,
  },
  speaking: {
    hex: '#281b4b',
    warp: 0.4,
    swirl: 1.25,
    drift: 1.5,
    depth: 0.95,
    pulse: 0.035,
    ripple: 0.06,
    speed: 2.4,
  },
}

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;
uniform vec3 u_tint;
uniform float u_warp;
uniform float u_swirl;
uniform float u_drift;
uniform float u_depth;
uniform float u_pulse;
uniform float u_ripple;

const int SPOTS = 6;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

/* Each spot travels its own path at its own two frequencies, so the six never
   settle into a pattern the eye can follow and there is no loop to catch. */
vec2 spotPos(float i, float t) {
  float a = i * 0.37;
  float b = 0.6 + fract(i / 3.0) * 0.9;
  float c = 0.8 + fract((i + 1.0) / 4.0);
  return 0.5 + 0.5 * vec2(sin(t * b + a), cos(t * c + a * 1.5));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  /* The disc's own edge, antialiased. Everything outside it is transparent —
     the surface behind the orb is whatever the page put there. */
  vec2 centred = uv - 0.5;
  float d = length(centred) * 2.0;
  float mask = smoothstep(1.0, 0.988, d);
  if (mask <= 0.001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float t = u_time * 0.4 + 20.0;

  /* The breath moves the warp rather than the geometry: a disc that changed
     size would push the layout around it on every beat. */
  float breath = 1.0 + sin(u_time * 1.15) * u_pulse * 4.0;

  /* Centre-weighted warp, so the middle churns while the rim stays a clean
     circle. How hard it churns is the state's own. */
  float radius = smoothstep(0.0, 1.0, length(centred));
  float centre = 1.0 - radius;
  float warp = u_warp * breath;
  for (float i = 1.0; i <= 2.0; i += 1.0) {
    uv.x += warp * centre / i * sin(t + i * 0.4 * uv.y) * cos(0.2 * t + i * 2.4 * uv.y);
    uv.y += warp * centre / i * cos(t + i * 2.0 * uv.x);
  }

  /* A swirl that strengthens toward the rim, so the spots wrap the edge
     rather than running off it. */
  vec2 p = uv - 0.5;
  p = rot(-1.4 * radius * u_swirl) * p;
  uv = p + 0.5;

  /* One purple ramp at three stops. */
  vec3 pale = mix(vec3(1.0), u_tint, 0.75);
  vec3 deep = u_color * 0.62;

  vec3 col = vec3(0.0);
  float totalW = 0.0;
  for (int i = 0; i < SPOTS; i++) {
    float fi = float(i);
    vec2 pos = spotPos(fi, t * u_drift);

    /* Inverse distance to a high power: near a spot its own tone wins
       outright, and between spots the falloff does the blending. */
    float dist = pow(length(uv - pos), 3.5);
    float w = 1.0 / (dist + 1e-3);

    float k = fi / float(SPOTS - 1);
    vec3 tone = k < 0.5
      ? mix(deep, u_color, k * 2.0)
      : mix(u_color, pale, (k - 0.5) * 2.0);

    col += tone * w;
    totalW += w;
  }
  col /= totalW;

  /* Listening's signature: a ring running out from the middle, lifting the
     blend toward the pale end as it passes. */
  col = mix(col, pale, u_ripple * 0.28 * (0.5 + 0.5 * sin(d * 10.0 - u_time * 2.6)));

  /* How far from pale the whole thing sits. */
  col = mix(pale, col, 0.45 + u_depth * 0.55);

  /* Fine grain, because a blend this soft bands on an 8-bit display. */
  col += (hash21(gl_FragCoord.xy) - 0.5) * 0.02;

  /* The rim, so the silhouette holds on a white card. */
  col = mix(col, u_color, smoothstep(0.86, 1.0, d) * 0.35);

  col = clamp(col, 0.0, 1.0);

  gl_FragColor = vec4(col * mask, mask);
}
`

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  }
  const n = parseInt(h, 16)
  if (h.length !== 6 || Number.isNaN(n)) return [0.1, 0.45, 0.95]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function paramsFor(state: MeshOrbState, color?: string): MeshParams {
  const { hex, ...motion } = STATE_PARAMS[state]
  return { ...motion, color: hexToRgb(color ?? hex) }
}

const NUMERIC_KEYS = [
  'warp',
  'swirl',
  'drift',
  'depth',
  'pulse',
  'ripple',
  'speed',
] as const

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k

const MeshOrb = ({
  size = 240,
  color,
  state = 'idle',
  className,
  style,
  ...props
}: MeshOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* The state lives on refs, not in the effect's deps. Rebuilding the GL
     program on a state change restarts it at t = 0, so the blend would
     teleport and the colour would cut. One program runs for the life of the
     canvas and every state is a target the current values walk toward. */
  const target = useRef(paramsFor(state, color))
  const kick = useRef<() => void>(() => {})

  useEffect(() => {
    target.current = paramsFor(state, color)
    kick.current()
  }, [state, color])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: true, alpha: true })
    if (!gl) return

    const program = gl.createProgram()
    const vert = compile(gl, gl.VERTEX_SHADER, VERT)
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!program || !vert || !frag) return

    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      color: gl.getUniformLocation(program, 'u_color'),
      tint: gl.getUniformLocation(program, 'u_tint'),
      warp: gl.getUniformLocation(program, 'u_warp'),
      swirl: gl.getUniformLocation(program, 'u_swirl'),
      drift: gl.getUniformLocation(program, 'u_drift'),
      depth: gl.getUniformLocation(program, 'u_depth'),
      pulse: gl.getUniformLocation(program, 'u_pulse'),
      ripple: gl.getUniformLocation(program, 'u_ripple'),
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const px = Math.round(size * dpr)
    canvas.width = px
    canvas.height = px
    gl.viewport(0, 0, px, px)
    gl.uniform2f(u.resolution, px, px)
    gl.uniform3f(u.tint, ...hexToRgb(TINT))

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* Mounts already at its state — the walk is for changes, not for arrival.
       The phase starts off zero so the first frame is a formed blend rather
       than the six spots stacked on their shared origin. */
    const now = paramsFor(state, color)
    const current: MeshParams = { ...now, color: [...now.color] }
    let phase = 4.2
    let last = performance.now()
    let raf = 0
    let running = false

    const frame = (time: number) => {
      const dt = Math.min((time - last) / 1000, 0.05)
      last = time

      /* Frame-rate independent easing: an exponential approach with a ~0.3s
         time constant, so a 30fps machine takes the same 0.6s to arrive as a
         144fps one. Reduced motion skips the walk and lands. */
      const k = reduce ? 1 : 1 - Math.exp(-dt / 0.3)
      let moving = 0

      for (const key of NUMERIC_KEYS) {
        moving = Math.max(moving, Math.abs(target.current[key] - current[key]))
        current[key] = lerp(current[key], target.current[key], k)
      }
      for (let i = 0; i < 3; i++) {
        moving = Math.max(
          moving,
          Math.abs(target.current.color[i] - current.color[i]),
        )
        current.color[i] = lerp(current.color[i], target.current.color[i], k)
      }

      if (!reduce) phase += dt * current.speed

      gl.uniform1f(u.time, phase)
      gl.uniform3f(u.color, ...current.color)
      gl.uniform1f(u.warp, current.warp)
      gl.uniform1f(u.swirl, current.swirl)
      gl.uniform1f(u.drift, current.drift)
      gl.uniform1f(u.depth, current.depth)
      gl.uniform1f(u.pulse, current.pulse)
      gl.uniform1f(u.ripple, current.ripple)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      /* Under reduced motion the loop stops as soon as it has arrived, and a
         state change wakes it for the one frame that draws the new one. */
      if (!reduce || moving > 0.0005) {
        raf = requestAnimationFrame(frame)
      } else {
        running = false
      }
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    kick.current = start
    start()

    return () => {
      kick.current = () => {}
      running = false
      cancelAnimationFrame(raf)
      gl.deleteProgram(program)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
      gl.deleteBuffer(buffer)
    }
    /* `state` and `color` are read once, for the values this mounts at; every
       later change reaches the loop through `target`. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  return (
    <div
      data-slot="mesh-orb"
      className={cn('relative overflow-hidden rounded-full', className)}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      {...props}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

export { MeshOrb }
export default MeshOrb
