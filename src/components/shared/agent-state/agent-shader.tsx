"use client";

import { useEffect, useRef } from "react";

import { classRgb } from "@/components/shared/orb-avatar";
import { cn } from "@/lib/utils";

import {
  AGENT_TONE,
  createShader,
  SHADER_HEAD,
  SHADER_UNIFORMS,
  useAgentLoop,
  type AgentState,
} from "./engine";

type Program = NonNullable<ReturnType<typeof createShader>>;

/** One canvas, one fragment shader, fed the agent's state. */
export function AgentShader({
  body,
  state,
  className,
}: {
  /** GLSL after `SHADER_HEAD`: helpers and `main()`. */
  body: string;
  state: AgentState;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const program = useRef<Program | null>(null);
  const tone = useRef<number[][]>([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    program.current = createShader(canvas, SHADER_HEAD + body, SHADER_UNIFORMS);
    tone.current = AGENT_TONE.map(classRgb);
    /* No loseContext here: Strict Mode remounts on the same canvas, and a lost context cannot be got back. */
    return () => {
      program.current = null;
    };
  }, [body]);

  useAgentLoop(ref, state, (f) => {
    const p = program.current;
    if (!p || !f.width || !f.height) return;
    const { gl, uniforms: u } = p;
    gl.viewport(0, 0, f.width, f.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.uRes, f.width, f.height);
    gl.uniform1f(u.uTime, f.time);
    gl.uniform3f(u.uState, f.listen, f.think, f.speak);
    gl.uniform1f(u.uLevel, f.level);
    const [a, b, c] = tone.current;
    gl.uniform3fv(u.uA, a);
    gl.uniform3fv(u.uB, b);
    gl.uniform3fv(u.uC, c);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  return (
    <canvas aria-hidden className={cn("size-full", className)} ref={ref} />
  );
}
