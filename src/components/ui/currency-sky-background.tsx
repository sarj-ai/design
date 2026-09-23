/**
 * A flowing terrain of currency glyphs, with layered waves and contour bands.
 * Draws light-on-dark or ink-on-white, set by `tone`.
 *
 * Filed under `src/components/ui` with the other vendored canvas pieces —
 * `fluid-orb`, `mesh-orb`, `shdr-31-sarj`, `dot-pattern`. This directory is
 * where the lint rules are off, which a canvas needs: `fillStyle` takes colour
 * strings, and there is no className for lint to read.
 *
 * The colours are not literals, though. The ramp is built from the live
 * `--primary` at draw time, so the terrain is the brand's purple and follows a
 * brand or whitelabel change rather than freezing one company's palette into a
 * vendored file. See GLYPHS below.
 *
 * It is a pure function of elapsed time drawn to a canvas, so none of the
 * motion rules apply either — there is no `transition-*` or `animate-*` class
 * here to pair with a `motion-reduce:`. Reduced motion is honoured in the loop
 * itself: the clock is pinned to zero and the terrain is drawn once, still.
 */
"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export interface CurrencySkyBackgroundProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  speed?: number;
  opacity?: number;
  cellWidth?: number;
  cellHeight?: number;
  fontSize?: number;
  fontFamily?: string;
  terrainScale?: number;
  contourSpacing?: number;
  paused?: boolean;
  /** Which end to draw at — light glyphs on near-black, or ink on white. */
  tone?: TerrainTone;
  /** Dissolve the terrain into the page across the bottom of the band. */
  fadeBottom?: boolean;
}

/** The glyph each brightness band is drawn with, dimmest first. `min` is the
    floor of that band on the 0–255 field `brightness()` returns. */
const GLYPHS = [
  { min: 15, char: "·" },
  { min: 50, char: "/" },
  { min: 100, char: "$" },
  { min: 160, char: "£" },
];

/**
 * The two ends the terrain can be drawn at, as lightness rungs at the brand's
 * hue. `backdrop` is the surface; `steps` line up with GLYPHS above.
 *
 * `light` is not `dark` with the numbers flipped about 0.5. It is the same
 * picture re-read: on black a denser field means *more light*, so the ramp
 * climbs; on white a denser field means *more ink*, so it descends. The
 * lightest rung stays close to the page so the sparse areas read as paper
 * rather than as a grey panel, and only the contour bands carry real colour.
 *
 * `lightness` is absolute — it sets the terrain's own contrast, which belongs
 * to the picture rather than to the brand. `chroma` is a multiple of the
 * brand's own chroma, so a whitelabel with a greyer primary gets a greyer
 * terrain instead of one that stays saturated while everything around it calms
 * down. Same construction `globals.css` uses for --color-primary-light: the
 * brand colour moved toward white or black, written in oklch rather than
 * color-mix because these are canvas fillStyles, not CSS properties.
 */
const TONES = {
  dark: {
    backdrop: { lightness: 0.13, chroma: 0.42 },
    steps: [
      { lightness: 0.22, chroma: 0.56 },
      { lightness: 0.3, chroma: 0.79 },
      { lightness: 0.46, chroma: 1.12 },
      { lightness: 0.72, chroma: 1.45 },
    ],
  },
  light: {
    backdrop: { lightness: 1, chroma: 0 },
    steps: [
      { lightness: 0.93, chroma: 0.3 },
      { lightness: 0.86, chroma: 0.5 },
      { lightness: 0.72, chroma: 0.85 },
      { lightness: 0.55, chroma: 1.15 },
    ],
  },
};

export type TerrainTone = keyof typeof TONES;

/** The bottom dissolve. Holds full strength through the upper half, then runs
    a long ramp to nothing so there is no line where the terrain stops. */
const FADE =
  "linear-gradient(to bottom, black 0%, black 42%, rgba(0,0,0,0.55) 72%, transparent 100%)";

/** Sarj purple, for when --primary cannot be read or is not oklch. */
const BRAND_FALLBACK = { lightness: 0.334, chroma: 0.107, hue: 291.8 };

/** The live value of --primary, so the terrain follows a brand change. */
function readBrand(element: HTMLElement) {
  const raw = getComputedStyle(element).getPropertyValue("--primary").trim();
  const match = raw.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/i);
  if (!match) return BRAND_FALLBACK;
  const lightness = parseFloat(match[1]) / (match[2] ? 100 : 1);
  const chroma = parseFloat(match[3]);
  const hue = parseFloat(match[4]);
  if (![lightness, chroma, hue].every(Number.isFinite)) return BRAND_FALLBACK;
  return { lightness, chroma, hue };
}

/** One rung of the ramp, as a canvas-ready colour. */
function rung(
  brand: { chroma: number; hue: number },
  step: { lightness: number; chroma: number },
) {
  return `oklch(${step.lightness} ${(brand.chroma * step.chroma).toFixed(4)} ${brand.hue})`;
}

function waves(x: number, y: number, time: number) {
  return Math.sin(0.8 * x + 0.3 * time) * Math.cos(0.6 * y + 0.2 * time) * 0.5
    + 0.25 * Math.sin(1.6 * x + 1.2 * y + 0.15 * time)
    + Math.sin(0.3 * x - 0.4 * time) * Math.cos(0.4 * y + 0.25 * time) * 0.6
    + 0.3 * Math.sin(0.5 * (x + y) + 0.35 * time)
    + Math.sin(2.5 * x + 0.1 * time) * Math.cos(2.8 * y - 0.12 * time) * 0.15;
}

function brightness(x: number, y: number, time: number, spacing: number) {
  const field = waves(x, y, time) + 0.4 * waves(x * 2.2, y * 2.2, time * 0.7)
    + 0.15 * waves(x * 4.5, y * 4.5, time * 0.4);
  const value = Math.max(0, Math.min(1, (field + 1.8) / 3.6));
  const band = value % spacing / spacing;
  const contour = band < 0.12 || band > 0.88;
  let light = Math.round(contour ? 200 * value + 55 : 140 * value);
  if (contour) {
    const dx = waves(x + 0.01, y, time) - waves(x - 0.01, y, time);
    const dy = waves(x, y + 0.01, time) - waves(x, y - 0.01, time);
    const slope = 12 * Math.hypot(dx, dy);
    if (slope > 0.5) light = Math.min(255, light + Math.round(40 * slope));
  }
  return light;
}

export default function CurrencySkyBackground({
  children, className = "", style, speed = 0.9, opacity = 1,
  cellWidth = 12, cellHeight = 14, fontSize = 12,
  fontFamily = "ui-monospace, monospace", terrainScale = 0.13,
  contourSpacing = 0.08, paused = false, tone = "dark", fadeBottom = false,
}: CurrencySkyBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    // Read once per effect rather than per frame: --primary does not change
    // between renders, and getComputedStyle in a rAF loop is a forced reflow.
    const brand = readBrand(host);
    const ramp = TONES[tone] ?? TONES.dark;
    const colors = ramp.steps.map((step) => rung(brand, step));
    host.style.backgroundColor = rung(brand, ramp.backdrop);
    const positive = (value: number, fallback: number, min: number) => Number.isFinite(value) ? Math.max(min, value) : fallback;
    const cw = positive(cellWidth, 12, 4);
    const ch = positive(cellHeight, 14, 4);
    const size = positive(fontSize, 12, 1);
    const scale = positive(terrainScale, 0.13, 0.001);
    const spacing = positive(contourSpacing, 0.08, 0.001);
    const rate = positive(speed, 0.9, 0);
    const alpha = Number.isFinite(opacity) ? Math.max(0, Math.min(1, opacity)) : 1;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let frameNumber = 0;
    let previous = 0;
    let elapsed = 0;
    let visible = false;
    // Reuse color buckets instead of changing fillStyle for every cell.
    const buckets: number[][] = GLYPHS.map(() => []);
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `400 ${size}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = alpha;
      buckets.forEach((bucket) => { bucket.length = 0; });
      const columns = Math.ceil(width / cw) + 1;
      const rows = Math.ceil(height / ch) + 1;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const value = brightness((column + 0.5) * scale, (row + 0.5) * scale, elapsed, spacing);
          for (let i = GLYPHS.length - 1; i >= 0; i--) {
            if (value >= GLYPHS[i].min) {
              buckets[i].push(column * cw + cw / 2, row * ch + ch / 2);
              break;
            }
          }
        }
      }
      buckets.forEach((bucket, index) => {
        ctx.fillStyle = colors[index];
        for (let i = 0; i < bucket.length; i += 2) ctx.fillText(GLYPHS[index].char, bucket[i], bucket[i + 1]);
      });
      ctx.globalAlpha = 1;
    };
    const tick = (now: number) => {
      elapsed += Math.min((now - previous) / 1000, 0.1) * rate;
      previous = now;
      // The reference draws every second animation frame.
      if (++frameNumber % 2 === 0) draw();
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (reducedMotion.matches) elapsed = 0;
      draw();
      if (!paused && rate > 0 && visible && !document.hidden && !reducedMotion.matches) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const resize = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    };
  }, [speed, opacity, cellWidth, cellHeight, fontSize, fontFamily, terrainScale, contourSpacing, paused, tone]);

  return (
    <div ref={hostRef} className={`relative isolate h-full w-full overflow-hidden ${className}`} style={{ backgroundColor: rung(BRAND_FALLBACK, (TONES[tone] ?? TONES.dark).backdrop), ...style }}>
      {/* A mask, not a white overlay: it removes the glyphs rather than
          painting over them, so the band dissolves into whatever the page
          behind it happens to be instead of into one hardcoded colour. The
          ramp is long and starts around the headline's baseline — a short fade
          reads as a seam, which is the edge this is here to get rid of. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={
          fadeBottom
            ? {
                maskImage: FADE,
                WebkitMaskImage: FADE,
              }
            : undefined
        }
      />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}
