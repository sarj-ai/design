"use client";

import { useEffect, useId, useRef } from "react";

const STIFFNESS = 14;
const DAMPING = 2 * Math.sqrt(STIFFNESS);

export function GlowProgress({
  value,
  onSettled,
}: {
  value: number;
  onSettled?: () => void;
}) {
  const glowId = `progress-glow-${useId().replaceAll(/[^a-zA-Z0-9-]/g, "")}`;
  const target = useRef(value);
  const fill = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const settled = useRef(onSettled);

  useEffect(() => {
    target.current = value;
  }, [value]);

  useEffect(() => {
    settled.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shown = 0;
    let velocity = 0;
    let last = 0;
    let frame = 0;
    let done = false;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (still) {
        shown = target.current;
      } else {
        velocity +=
          (STIFFNESS * (target.current - shown) - DAMPING * velocity) * dt;
        shown = Math.min(100, Math.max(shown, shown + velocity * dt));
      }
      if (target.current >= 100 && 100 - shown < 0.3) shown = 100;
      draw();
      if (shown === 100 && !done) {
        done = true;
        settled.current?.();
      }
    };
    const draw = () => {
      const left = String(100 - shown);
      if (fill.current)
        fill.current.style.clipPath = `inset(0 ${left}% 0 0 round 9999px)`;
      if (glow.current)
        glow.current.style.clipPath = `inset(-6px ${left}% -6px -6px round 9999px)`;
      if (label.current)
        label.current.textContent = `${String(Math.round(shown))}%`;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-1 flex-1 rounded-full bg-muted text-primary">
        <div
          aria-hidden
          className="absolute inset-0 animate-progress-glow rounded-full bg-primary blur-xs motion-reduce:animate-none"
          ref={glow}
        />
        <div
          className="absolute inset-0 overflow-hidden rounded-full bg-primary"
          ref={fill}
        >
          <svg
            aria-hidden="true"
            className="absolute inset-y-0 left-0 h-full w-1/3 animate-progress-sheen text-background motion-reduce:animate-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 10"
          >
            <defs>
              <linearGradient
                id={`${glowId}-sheen`}
                x1="0"
                x2="1"
                y1="0"
                y2="0"
              >
                <stop offset="0" stopColor="currentColor" stopOpacity="0" />
                <stop
                  offset="0.5"
                  stopColor="currentColor"
                  stopOpacity="0.55"
                />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect fill={`url(#${glowId}-sheen)`} height="10" width="100" />
          </svg>
        </div>
      </div>
      <span
        aria-hidden
        className="w-9 text-end text-xs text-muted-foreground tabular-nums"
        ref={label}
      >
        0%
      </span>
    </div>
  );
}
