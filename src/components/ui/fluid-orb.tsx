'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

export type FluidOrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

export type FluidOrbProps = React.ComponentProps<'div'> & {
  size?: number
  color?: string
  /** Agent state. Sets the colour and the motion; `color` overrides the hue. */
  state?: FluidOrbState
}

/**
 * The four states, as everything the shader needs to draw one.
 *
 * Colour alone did not read: four purples an eighth of a step apart, on a ball
 * that moved identically in all four, is one picture with four captions. So a
 * state is a *motion* — how full the ball is, how hard the surface moves, how
 * much the body churns, and how fast the whole thing runs — and the colour is
 * the smallest part of it.
 *
 *  - `idle`      barely fills the ball, drifts. Nothing is being asked of it.
 *  - `listening` rises, breathes, and carries rings running out from the
 *                middle — the one state whose job is *taking something in*.
 *  - `thinking`  does not rise. It churns: the same volume, worked over.
 *  - `speaking`  tall, fast, big surface waves. It is putting something out.
 *
 * `color` is hex because the shader feeds `u_color` a vec3, and a WebGL uniform
 * cannot read a token class. The literals live in this file so no screen has to
 * write one — states travel by name, and `sarj/no-raw-color` stays satisfied
 * everywhere outside `components/ui`.
 *
 * Keep in step with `--primary-light`, `--primary-tint-foreground`, `--primary`
 * and `--primary-dark` in globals.css. `TINT` is `--primary-tint`.
 */
type OrbParams = {
  color: [number, number, number]
  /** Where the liquid sits, 0 (empty) to 1 (full). */
  level: number
  /** How far the surface travels, and how many crests are on it. */
  wave: number
  freq: number
  /** How much the body churns under the surface. */
  turb: number
  /** The slow rise and fall of the whole level. */
  pulse: number
  /** Rings running out from the middle. Listening's signature. */
  ripple: number
  /** Multiplies elapsed time, so every motion above scales together. */
  speed: number
}

const TINT = '#eeecfa'

const STATE_PARAMS: Record<FluidOrbState, Omit<OrbParams, 'color'> & { hex: string }> = {
  idle: {
    hex: '#6d6595',
    level: 0.34,
    wave: 0.012,
    freq: 3,
    turb: 0.06,
    pulse: 0.012,
    ripple: 0,
    speed: 0.35,
  },
  listening: {
    hex: '#4d3d80',
    level: 0.48,
    wave: 0.034,
    freq: 5,
    turb: 0.1,
    pulse: 0.06,
    ripple: 0.28,
    speed: 0.9,
  },
  thinking: {
    hex: '#392868',
    level: 0.52,
    wave: 0.018,
    freq: 8,
    turb: 0.34,
    pulse: 0.008,
    ripple: 0,
    speed: 1.9,
  },
  speaking: {
    hex: '#281b4b',
    level: 0.62,
    wave: 0.085,
    freq: 4,
    turb: 0.16,
    pulse: 0.022,
    ripple: 0.05,
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
uniform float u_level;
uniform float u_wave;
uniform float u_freq;
uniform float u_turb;
uniform float u_pulse;
uniform float u_ripple;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.6;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 c = uv - 0.5;
  float d = length(c) * 2.0;

  /* The disc's own edge, antialiased. Everything outside it is transparent —
     the surface behind the orb is whatever the page put there. */
  float mask = smoothstep(1.0, 0.988, d);
  if (mask <= 0.001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float t = u_time;

  /* Domain-warped fbm, drifting, so the churn has no seam to spot. How far it
     travels is the state's own turbulence: idle barely stirs, thinking is all
     stir. */
  vec2 drift = vec2(sin(t * 0.62), cos(t * 0.47)) * (0.22 + u_turb * 0.6);
  vec2 p = uv * 1.9 + drift;
  vec2 q = vec2(fbm(p), fbm(p + vec2(3.2, 1.5)));
  float f = fbm(p + 1.7 * q - drift);

  /* Flat on purpose. There is no fill level, no surface normal and no
     specular — those three are what made it read as a lit ball with a horizon
     drawn across it, and at any size above a favicon the horizon is the only
     thing you see. The form is stated once, at the rim; everything inside is
     the churn alone.

     The breath moves where the colour ramp lands rather than the geometry: a
     disc that changed size would push the layout around it on every beat. */
  float breath = sin(t * 1.15) * u_pulse;
  float shade = clamp(f + (0.34 - d) * 0.5 + breath, 0.0, 1.0);

  vec3 pale = mix(vec3(1.0), u_tint, 0.75);
  vec3 col = mix(pale, u_color, smoothstep(0.30, 0.78, shade));

  /* The rim, so the silhouette holds on a white card without shading the
     whole disc to get it. */
  col = mix(col, u_color, smoothstep(0.72, 1.0, d) * 0.5);

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

function paramsFor(state: FluidOrbState, color?: string): OrbParams {
  const { hex, ...motion } = STATE_PARAMS[state]
  return { ...motion, color: hexToRgb(color ?? hex) }
}

const NUMERIC_KEYS = [
  'level',
  'wave',
  'freq',
  'turb',
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

const FluidOrb = ({
  size = 240,
  color,
  state = 'idle',
  className,
  style,
  ...props
}: FluidOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* The state lives on refs, not in the effect's deps. Rebuilding the GL
     program on a state change is what made the orb jump: the new program
     started at t = 0, so the liquid teleported and the colour cut. Now one
     program runs for the life of the canvas and every state is a target the
     current values walk toward. */
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
      level: gl.getUniformLocation(program, 'u_level'),
      wave: gl.getUniformLocation(program, 'u_wave'),
      freq: gl.getUniformLocation(program, 'u_freq'),
      turb: gl.getUniformLocation(program, 'u_turb'),
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
       The phase starts off zero so the first frame is a formed surface rather
       than the flat spot the noise has at the origin. */
    const now = paramsFor(state, color)
    const current: OrbParams = { ...now, color: [...now.color] }
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
      gl.uniform1f(u.level, current.level)
      gl.uniform1f(u.wave, current.wave)
      gl.uniform1f(u.freq, current.freq)
      gl.uniform1f(u.turb, current.turb)
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
      data-slot="fluid-orb"
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

export { FluidOrb }
export default FluidOrb
