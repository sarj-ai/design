"use client";

import { useEffect, useRef } from "react";

export type AgentState = "listening" | "thinking" | "speaking";

export const AGENT_STATES: { value: AgentState; label: string }[] = [
  { value: "listening", label: "Listening" },
  { value: "thinking", label: "Thinking" },
  { value: "speaking", label: "Speaking" },
];

/** What one picture is drawn from. The three weights sum to 1 and ease between states, so a change of state is a blend, never a cut. */
export type AgentFrame = {
  time: number;
  listen: number;
  think: number;
  speak: number;
  /** 0–1: the caller's voice while listening, the agent's while speaking, nothing while thinking. */
  level: number;
  width: number;
  height: number;
  ratio: number;
};

/* How fast one state hands over to the next: about 400ms to settle. */
const BLEND = 7;

/* How fast the level follows the voice. Higher reads as twitchy. */
const FOLLOW = 14;

/** A speech-like envelope: syllables, words, and the pauses between them. Deterministic, so no two visuals disagree. */
function voice(t: number) {
  const syllable = Math.max(
    0,
    Math.sin(t * 9.1) * 0.6 + Math.sin(t * 5.3) * 0.4,
  );
  const word = 0.55 + 0.45 * Math.sin(t * 1.7 + Math.sin(t * 0.6) * 2);
  const pause = Math.sin(t * 0.83) > -0.55 ? 1 : 0.05;
  return Math.min(1, syllable * word * pause * 1.25);
}

function weights(state: AgentState): [number, number, number] {
  return [
    state === "listening" ? 1 : 0,
    state === "thinking" ? 1 : 0,
    state === "speaking" ? 1 : 0,
  ];
}

/** Sizes the canvas to its box, runs one rAF loop while it is on screen, and hands `draw` a frame. Under reduced motion it draws one still picture per state. */
export function useAgentLoop(
  ref: React.RefObject<HTMLCanvasElement | null>,
  state: AgentState,
  draw: (frame: AgentFrame) => void,
) {
  const target = useRef(weights(state));
  const drawRef = useRef(draw);
  const still = useRef<(() => void) | null>(null);

  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    target.current = weights(state);
    still.current?.();
  }, [state]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
    };
    resize();

    const current = [...target.current] as [number, number, number];
    let level = 0;
    let visible = true;
    let frame = 0;
    let last = performance.now();
    const start = last;

    const paint = (time: number) =>
      drawRef.current({
        time,
        listen: current[0],
        think: current[1],
        speak: current[2],
        level,
        width: canvas.width,
        height: canvas.height,
        ratio,
      });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      still.current = () => {
        current.splice(0, 3, ...target.current);
        level = 0.6 * (current[0] * 0.7 + current[2]);
        paint(2);
      };
      still.current();
      const sized = new ResizeObserver(() => {
        resize();
        still.current?.();
      });
      sized.observe(canvas);
      return () => sized.disconnect();
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = (now - start) / 1000;

      const k = 1 - Math.exp(-dt * BLEND);
      for (let i = 0; i < 3; i++)
        current[i] += (target.current[i] - current[i]) * k;

      /* The caller is quieter than the agent, and a thinking agent hears nothing. */
      const loud =
        current[0] * 0.75 * voice(time * 0.9 + 3) + current[2] * voice(time);
      level += (loud - level) * (1 - Math.exp(-dt * FOLLOW));

      if (visible) paint(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    seen.observe(canvas);
    const sized = new ResizeObserver(resize);
    sized.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      sized.disconnect();
    };
  }, [ref]);
}

/** A full-screen triangle and one fragment shader. Returns the uniform locations by name, or null without WebGL. */
export function createShader(
  canvas: HTMLCanvasElement,
  fragment: string,
  names: string[],
) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  const vertex = compile(
    gl.VERTEX_SHADER,
    "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }",
  );
  const frag = compile(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vertex || !frag || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = Object.fromEntries(
    names.map((name) => [name, gl.getUniformLocation(program, name)]),
  );
  return { gl, uniforms };
}

/** The shared GLSL head: the uniforms every agent shader takes, and the orb ramp. */
export const SHADER_HEAD = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uState;
uniform float uLevel;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;

vec3 ramp(float t) {
  vec3 col = mix(uA, uB, smoothstep(0.0, 0.5, t));
  return mix(col, uC, smoothstep(0.5, 1.0, t));
}
`;

export const SHADER_UNIFORMS = [
  "uRes",
  "uTime",
  "uState",
  "uLevel",
  "uA",
  "uB",
  "uC",
];

/** The orb's three violets, deepest first — the same light the avatar is made of. */
export const AGENT_TONE = ["bg-orb-deep", "bg-orb-body", "bg-orb-light"];
