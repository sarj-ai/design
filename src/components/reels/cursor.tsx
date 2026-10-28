"use client"

import { FPS, interpolate } from "@/lib/reels/anim"
import { poseAt, sinceClick, type Tour } from "@/lib/reels/cursor"
import { useFrame } from "@/components/reels/stage"
import { useShotScale } from "@/components/reels/shot"

const SIZE = 38
const RIPPLE = { duration: 0.45, size: 98 }

export function Cursor({ tour }: { tour: Tour }) {
  const frame = useFrame()
  const shotScale = useShotScale()
  const seconds = frame / FPS

  const pose = poseAt(tour, seconds)
  const since = sinceClick(tour, seconds)

  const counter = 1 / shotScale

  return (
    <div
      className="pointer-events-none absolute top-0 left-0"
      style={{
        opacity: pose.opacity,
        transform: `translate(${pose.x.toFixed(2)}px, ${pose.y.toFixed(
          2,
        )}px) scale(${counter.toFixed(5)})`,
        transformOrigin: "top left",
      }}
    >
      {since !== null && since < RIPPLE.duration ? (
        <span
          className="absolute rounded-full ring-2 ring-primary"
          style={{
            height: interpolate(
              since,
              [0, RIPPLE.duration],
              [SIZE * 0.4, RIPPLE.size],
            ),
            left: 0,
            opacity: interpolate(since, [0, RIPPLE.duration], [0.55, 0]),
            top: 0,
            transform: "translate(-50%, -50%)",
            width: interpolate(
              since,
              [0, RIPPLE.duration],
              [SIZE * 0.4, RIPPLE.size],
            ),
          }}
        />
      ) : null}

      <svg
        aria-hidden="true"
        className="relative block"
        fill="none"
        height={SIZE}
        style={{
          transform: `scale(${pose.scale.toFixed(4)})`,
          transformOrigin: "top left",
        }}
        viewBox="0 0 24 24"
        width={SIZE}
      >
        <path
          className="stroke-foreground"
          d="M5 2.5 19 12.2l-6.1.9 3.2 6.6-2.6 1.3-3.2-6.6-4.3 4.2z"
          strokeLinejoin="round"
          strokeWidth={3.4}
        />
        <path
          className="fill-background"
          d="M5 2.5 19 12.2l-6.1.9 3.2 6.6-2.6 1.3-3.2-6.6-4.3 4.2z"
        />
      </svg>
    </div>
  )
}
