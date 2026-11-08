"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { AgentShader } from "./agent-shader";
import { AGENT_TONE, useAgentLoop, type AgentState } from "./engine";

/* Ten lines of one sine each, staggered in speed — the pasted WaveLines shader, with the
   rainbow swapped for the orb ramp and alpha out so it sits on a light card. Each state
   is a whole displacement, so blending two of them is just a weighted sum. */
const WAVES = /* glsl */ `
void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  float aspect = uRes.x / uRes.y;
  float px = 2.0 / uRes.y;
  float x = uv.x;
  float fade = 1.0 - smoothstep(aspect * 0.5, aspect, abs(x));

  float clear = 1.0;
  vec3 col = vec3(0.0);
  float weight = 0.0;
  for (float layer = 0.0; layer < 1.0; layer += 0.1) {
    /* Listening: the lines meet at the ends and part in the middle, like a lens that
       opens as the caller speaks, with a slow sway so it never sits dead still. */
    float lens = exp(-x * x * 1.4);
    float dL = (layer - 0.45) * (0.24 + 0.9 * uLevel) * lens
      + 0.05 * sin(1.6 * x - uTime * 0.9 + layer * 1.5) * lens;

    /* Thinking: flat, with one packet of ripple running along the lines. */
    float head = mod(uTime * 1.1 + layer * 0.35, 2.0 * aspect + 1.2) - aspect - 0.6;
    float dT = 0.22 * exp(-(x - head) * (x - head) * 4.84)
      * sin(7.0 * x - uTime * 3.0 * (1.0 - layer * 0.7) + layer * 2.4);

    /* Speaking: tall and quick, driven by the agent's voice. */
    float dS = (0.06 + 0.6 * uLevel) * (1.0 - layer * 0.5)
      * (0.6 + 0.4 * sin(uTime * 1.3 + layer * 5.0))
      * sin(3.2 * x - uTime * 2.0 * (1.0 - layer * 0.7) - layer * 2.4);

    float y = uv.y - (uState.x * dL + uState.y * dT + uState.z * dS);
    float b = 1.0 - smoothstep(0.0, 1.5 * px, abs(y));
    clear *= 1.0 - 0.6 * b;
    col += ramp(0.1 + 0.4 * layer) * b;
    weight += b;
  }

  float a = (1.0 - clear) * fade;
  gl_FragColor = vec4(col / max(weight, 1e-4) * a, a);
}
`;

/* Six fine strands on one ring, each drawn at partial opacity so where they cross reads
   denser. Listening is a loose skein that opens with the caller; thinking twists the
   strands into a rope with one bright arc running round it; speaking plucks the higher
   harmonics, each strand out of phase, so a loud voice frays the ring. */
const STRING = /* glsl */ `
void main() {
  float side = min(uRes.x, uRes.y);
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / side;
  float px = 2.0 / side;
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  float clear = 1.0;
  vec3 col = vec3(0.0);
  float weight = 0.0;
  for (int i = 0; i < 6; i++) {
    float s = float(i) / 5.0;
    float o = float(i) * 1.0472;

    float rL = 0.6 + 0.05 * uLevel
      + (0.045 + 0.14 * uLevel) * sin(2.0 * a + uTime * 0.7 + o)
      + 0.025 * sin(3.0 * a - uTime * 0.5 + o * 2.0);
    float rT = 0.56 + 0.07 * sin(3.0 * a - uTime * 2.4 + o);
    float rS = 0.6 + (0.02 + 0.16 * uLevel)
      * (0.6 * sin(5.0 * a + uTime * 2.4 + o) + 0.4 * sin(3.0 * a - uTime * 1.6 + o * 1.7));

    float radius = uState.x * rL + uState.y * rT + uState.z * rS;
    float b = 1.0 - smoothstep(0.0, 1.2 * px, abs(r - radius));

    float trail = mod(a - uTime * 2.6, 6.2832);
    b *= mix(1.0, 0.25 + 0.75 * exp(-trail * 0.5), uState.y);

    clear *= 1.0 - 0.55 * b;
    col += ramp(0.05 + 0.5 * s) * b;
    weight += b;
  }

  float alpha = 1.0 - clear;
  gl_FragColor = vec4(col / max(weight, 1e-4) * alpha, alpha);
}
`;

export function AgentWaves({
  state,
  className,
}: {
  state: AgentState;
  className?: string;
}) {
  return <AgentShader body={WAVES} className={className} state={state} />;
}

export function AgentString({
  state,
  className,
}: {
  state: AgentState;
  className?: string;
}) {
  return <AgentShader body={STRING} className={className} state={state} />;
}

/* A 5 x 5 loader: fixed small dots, a few steps of opacity, time moving in steps. */
const GRID = 5;
const DOT = 6;
const PITCH = 10;
const STEPS = 9; // per second

/* The outer ring clockwise from the top-left, and the inner ring the same way. */
const OUTER = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [4, 1],
  [4, 2],
  [4, 3],
  [4, 4],
  [3, 4],
  [2, 4],
  [1, 4],
  [0, 4],
  [0, 3],
  [0, 2],
  [0, 1],
];
const INNER = [
  [1, 1],
  [2, 1],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 3],
  [1, 3],
  [1, 2],
];

/* Trail behind a head running round a ring: the head, then fading. */
function orbit(ring: number[][], head: number, trail: number[]) {
  const out = new Map<string, number>();
  trail.forEach((v, back) => {
    const [x, y] =
      ring[(((head - back) % ring.length) + ring.length) % ring.length];
    out.set(`${x},${y}`, v);
  });
  return out;
}

/** Five by five. Listening draws rings inward, thinking runs two dots round in opposite directions, speaking is a mirrored level meter. */
export function AgentDots({
  state,
  className,
}: {
  state: AgentState;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ink = useRef("");

  useEffect(() => {
    const swatch = document.createElement("span");
    swatch.className = `${AGENT_TONE[0]} hidden`;
    document.body.append(swatch);
    ink.current = getComputedStyle(swatch).backgroundColor;
    swatch.remove();
  }, []);

  useAgentLoop(ref, state, (f) => {
    const context = ref.current?.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, f.width, f.height);
    context.fillStyle = ink.current;

    const step = Math.floor(f.time * STEPS);
    const pitch = PITCH * f.ratio;
    const ox = f.width / 2 - pitch * 2;
    const oy = f.height / 2 - pitch * 2;

    /* Listening: one ring lit at a time, outer to centre, as loud as the caller. */
    const ring = 2 - (Math.floor(step / 3) % 3);
    const loud = 0.35 + 0.65 * Math.min(1, f.level * 1.6);

    /* Thinking. */
    const outer = orbit(OUTER, step, [1, 0.7, 0.45, 0.25]);
    const inner = orbit(INNER, -Math.floor(step / 2), [0.85, 0.4]);

    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const d = Math.max(Math.abs(col - 2), Math.abs(row - 2));
        const listen = (d === ring ? 1 : d === (ring + 1) % 3 ? 0.4 : 0) * loud;

        const key = `${col},${row}`;
        const think = outer.get(key) ?? inner.get(key) ?? 0;

        /* Speaking: each column a bar mirrored about the middle row; silence is a flat line. */
        const shape = [0.45, 0.8, 1, 0.8, 0.45][col];
        const wobble = 0.7 + 0.3 * Math.sin(f.time * 11 + col * 1.9);
        const height = f.level * shape * wobble * 2.6;
        const reach = Math.abs(row - 2);
        const speak =
          reach === 0
            ? 0.45 + 0.55 * Math.min(1, height * 2)
            : Math.min(1, Math.max(0, height - reach + 1)) * (1 - reach * 0.15);

        const v = Math.min(
          1,
          f.listen * listen + f.think * think + f.speak * speak,
        );
        /* Five steps of opacity, so it reads as a matrix, not a gradient. */
        context.globalAlpha = 0.12 + 0.88 * (Math.round(v * 4) / 4);
        context.beginPath();
        context.arc(
          ox + col * pitch,
          oy + row * pitch,
          (DOT / 2) * f.ratio,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    }
    context.globalAlpha = 1;
  });

  return (
    <canvas aria-hidden className={cn("size-full", className)} ref={ref} />
  );
}
