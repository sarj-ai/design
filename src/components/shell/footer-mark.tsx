"use client";

import { useEffect, useRef } from "react";

/* The orb's violets, walked through in order as the pointer travels. The brand purple is too dark: half-faded, it reads grey. */
const TONES = ["bg-orb-deep", "bg-orb-body", "bg-orb-light", "bg-orb-body"];

/* How long a stretch of trail lasts, in ms. */
const LIFE = 1400;

/* Pointer travel, in CSS pixels, between two blobs. */
const SPACING = 6;

function cssColour(className: string) {
  const swatch = document.createElement("span");
  swatch.className = `${className} hidden`;
  document.body.append(swatch);
  const value = getComputedStyle(swatch).backgroundColor;
  swatch.remove();
  return value;
}

/** One soft disc per tone, blurred once up front so drawing the trail is a cheap drawImage. */
function sprite(colour: string, radius: number) {
  const size = radius * 4;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.filter = `blur(${radius * 0.45}px)`;
  context.fillStyle = colour;
  context.beginPath();
  context.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  context.fill();
  return canvas;
}

/**
 * The footer wordmark: an outline at rest, and where the pointer passes, a glowing trail
 * that fills the letters and fades — after the cursor trail on shaders.com. The trail is
 * painted to a canvas, then cut to the glyphs by drawing the same text over it with
 * `destination-in`, so it never shows outside the letters.
 */
export function FooterMark() {
  const wrap = useRef<HTMLParagraphElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current;
    const glyphs = text.current;
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!box || !glyphs || !canvas || !context) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    let sprites: HTMLCanvasElement[] = [];
    let font = "";
    let spacing = "0px";
    let originX = 0;
    let baseline = 0;
    let radius = 0;

    const measure = () => {
      const rect = box.getBoundingClientRect();
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);

      const style = getComputedStyle(glyphs);
      const size = parseFloat(style.fontSize);
      font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
      spacing = style.letterSpacing;
      context.font = font;
      context.letterSpacing = spacing;
      const metrics = context.measureText(glyphs.textContent ?? "");
      const lineBox = glyphs.getBoundingClientRect();
      const content =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      originX = lineBox.left - rect.left + parseFloat(style.paddingLeft);
      baseline =
        lineBox.top -
        rect.top +
        (lineBox.height - content) / 2 +
        metrics.fontBoundingBoxAscent;

      radius = size * 0.12;
      sprites = TONES.map((tone) => sprite(cssColour(tone), radius * ratio));
    };

    let frame = 0;
    let last: { x: number; y: number } | null = null;
    let travelled = 0;
    const trail: { x: number; y: number; born: number; tone: number }[] = [];

    /* Redrawn from scratch every frame, each blob as faint as it is old: fading by
       painting over the last frame leaves 8-bit residue that never quite clears. */
    const tick = (now: number) => {
      while (trail.length && now - trail[0].born > LIFE) trail.shift();

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.globalCompositeOperation = "source-over";
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (!trail.length) {
        frame = 0;
        return;
      }

      for (const point of trail) {
        const left = 1 - (now - point.born) / LIFE;
        context.globalAlpha = 0.9 * left * left;
        const image = sprites[point.tone];
        context.drawImage(
          image,
          point.x * ratio - image.width / 2,
          point.y * ratio - image.height / 2,
        );
      }

      /* Keep only what falls inside the letters. */
      context.globalCompositeOperation = "destination-in";
      context.globalAlpha = 1;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.font = font;
      context.letterSpacing = spacing;
      context.fillText(glyphs.textContent ?? "", originX, baseline);

      frame = requestAnimationFrame(tick);
    };

    const move = (event: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      /* Fill the gap since the last event, so a fast flick is still one ribbon. */
      const from = last ?? point;
      const steps = Math.max(
        1,
        Math.ceil(Math.hypot(point.x - from.x, point.y - from.y) / SPACING),
      );
      const now = performance.now();
      for (let i = 1; i <= steps; i++) {
        travelled += SPACING;
        trail.push({
          x: from.x + ((point.x - from.x) * i) / steps,
          y: from.y + ((point.y - from.y) * i) / steps,
          born: now,
          /* The tone walks with the distance travelled. */
          tone: Math.floor(travelled / 90) % TONES.length,
        });
      }
      last = point;
      frame ||= requestAnimationFrame(tick);
    };
    const leave = () => {
      last = null;
    };

    let ready = true;
    document.fonts.ready.then(() => ready && measure());
    const sized = new ResizeObserver(measure);
    sized.observe(box);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerleave", leave);

    return () => {
      ready = false;
      cancelAnimationFrame(frame);
      sized.disconnect();
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <p aria-hidden className="footer-mark relative select-none" ref={wrap}>
      <canvas
        className="pointer-events-none absolute inset-0 size-full"
        ref={ref}
      />
      <span className="relative" ref={text}>
        sarj.ai
      </span>
    </p>
  );
}
