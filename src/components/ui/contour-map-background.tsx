/**
 * Animated topographic contour lines over a slowly morphing landscape, with a
 * bolder index line every fifth level.
 *
 * Filed under `src/components/ui` with the other vendored canvas pieces —
 * `currency-sky-background`, `dot-pattern` — where the lint rules are off,
 * which a shader needs.
 *
 * The colours are not literals. `color` and `background` take any CSS colour,
 * tokens included (`var(--primary)`), and are resolved against the page at
 * draw time, so the lines follow a brand or whitelabel change.
 *
 * Reduced motion is honoured in the loop: the clock is pinned to zero and the
 * landscape is drawn once, still.
 */
"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export interface ContourMapBackgroundProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Line colour — any CSS colour, `var(--token)` included. */
  color?: string;
  /** Paper colour — any CSS colour, `var(--token)` included. */
  background?: string;
  /** How many contour levels span the landscape. */
  levels?: number;
  /** Line thickness in px. */
  lineWidth?: number;
  speed?: number;
  /** Fade the lines out toward the bottom edge, so the band ends in the page
      rather than on a hard line. */
  fadeBottom?: boolean;
}

/** Same fade the currency sky uses, so swapping one for the other keeps the
    band's edge where it was. */
const FADE =
  "linear-gradient(to bottom, black 0%, black 42%, rgba(0,0,0,0.55) 72%, transparent 100%)";

const VERTEX = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `
precision mediump float;
uniform vec2 uSize;
uniform float uTime;
uniform float uLevels;
uniform float uWidth;
uniform vec3 uInk;
uniform vec3 uPaper;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y);
}

// Three octaves; the landscape morphs by sliding each octave a different way.
float landscape(vec2 p, float t) {
  float v = 0.0;
  v += 0.55 * noise(p * 1.4 + vec2(t * 0.05, -t * 0.03));
  v += 0.30 * noise(p * 3.1 + vec2(-t * 0.04, t * 0.06) + 7.0);
  v += 0.15 * noise(p * 6.5 + vec2(t * 0.08, t * 0.02) + 19.0);
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  vec2 p = vec2(uv.x * uSize.x / uSize.y, uv.y);
  float h = landscape(p, uTime) * uLevels;
  // Distance to the nearest whole level, in levels. The field's gradient
  // converts a pixel width into level units, so lines stay the same width on
  // steep slopes and on flats.
  float grad = length(vec2(dFdx(h), dFdy(h))) + 1e-5;
  float f = fract(h);
  float d = min(f, 1.0 - f);
  // ("half" is reserved in GLSL ES, hence the longer name.)
  float halfWidth = uWidth * grad;
  float aa = grad;
  float line = 1.0 - smoothstep(halfWidth, halfWidth + aa, d);
  float thick = 1.0 - smoothstep(halfWidth * 2.2, halfWidth * 2.2 + aa, d);
  // Every fifth contour is an index line: thicker and fully opaque.
  float level = floor(h + 0.5);
  float isIndex = 1.0 - step(0.2, fract(level / 5.0));
  float ink = max(line * 0.55, thick * isIndex);
  gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
}
`;

/**
 * Any CSS colour → [r, g, b] in 0..1. The browser does the parsing: the value
 * is set as a colour on a probe inside `host` (so `var()` resolves against the
 * page's tokens), and the computed colour is painted to a 1px canvas and read
 * back, which flattens oklch and color-mix down to sRGB.
 */
function resolveColour(host: HTMLElement, value: string): [number, number, number] | null {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  host.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || !computed) return null;
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export default function ContourMapBackground({
  children, className = "", style, color = "color-mix(in oklch, var(--primary) 28%, var(--background))", background = "var(--background)",
  levels = 14, lineWidth = 1, speed = 1, fadeBottom = false,
}: ContourMapBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    // Transparent paper where the canvas is masked, so the fade reveals the
    // host's own background rather than black.
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    // dFdx/dFdy need this extension on WebGL1; without it the lines can't be
    // made resolution-independent, so bail to the plain background.
    if (!gl.getExtension("OES_standard_derivatives")) return;
    const program = gl.createProgram();
    if (!program) return;
    const shaders: WebGLShader[] = [];
    const dispose = () => {
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteProgram(program);
    };
    const sources = [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, `#extension GL_OES_standard_derivatives : enable\n${FRAGMENT}`]] as const;
    for (const [type, source] of sources) {
      const shader = gl.createShader(type);
      if (!shader) { dispose(); return; }
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { dispose(); return; }
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { dispose(); return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const sizeUniform = uniform("uSize");
    const timeUniform = uniform("uTime");
    gl.uniform3fv(uniform("uInk"), resolveColour(host, color) ?? [0.5, 0.45, 0.65]);
    gl.uniform3fv(uniform("uPaper"), resolveColour(host, background) ?? [1, 1, 1]);
    gl.uniform1f(uniform("uLevels"), Number.isFinite(levels) ? Math.max(2, levels) : 14);
    const widthUniform = uniform("uWidth");
    const px = Number.isFinite(lineWidth) ? Math.max(0.25, lineWidth) : 1;
    const rate = Number.isFinite(speed) ? Math.max(0, speed) : 1;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let elapsed = 0;
    let previous = 0;
    let frame = 0;
    let visible = false;

    const draw = () => {
      gl.uniform1f(timeUniform, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const tick = (now: number) => {
      elapsed += Math.min((now - previous) / 1000, 0.1) * rate;
      previous = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (reducedMotion.matches) elapsed = 0;
      draw();
      if (rate > 0 && visible && !document.hidden && !reducedMotion.matches) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(host.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(host.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(sizeUniform, canvas.width, canvas.height);
      gl.uniform1f(widthUniform, px * dpr * 0.5);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    intersection.observe(host);
    reducedMotion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      reducedMotion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      gl.deleteBuffer(buffer);
      dispose();
    };
  }, [color, background, levels, lineWidth, speed]);

  return (
    <div ref={hostRef} className={`relative isolate h-full w-full overflow-hidden ${className}`} style={{ backgroundColor: background, ...style }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={fadeBottom ? { maskImage: FADE, WebkitMaskImage: FADE } : undefined}
      />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}
