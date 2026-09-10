"use client"

import { FPS, interpolate } from "@/lib/reels/anim"
import { poseAt, sinceClick, type Tour } from "@/lib/reels/cursor"
import { useFrame } from "@/components/reels/stage"
import { useShotScale } from "@/components/reels/shot"

/**
 * How big the pointer sits on the canvas, whatever the camera is doing.
 *
 * Larger than a real pointer looks on a desktop, deliberately. A reel is
 * watched in a Slack preview at a fraction of 1920 wide, and a true-to-life
 * 24px cursor disappears at that size — the one thing the viewer is meant to
 * be following.
 */
const SIZE = 38
const RIPPLE = { duration: 0.45, size: 98 }

/**
 * The scripted pointer.
 *
 * Goes inside a `<Shot>`, positioned in the screenshot's own pixels, so it
 * lands on the same control however the shot is framed. It counter-scales
 * against the camera: a real pointer keeps its size on screen while the UI
 * behind it grows, and one that grows with the zoom instantly reads as a
 * sticker on a photograph rather than a hand using the product.
 *
 * The shape is a stroked arrow rather than the filled-with-a-drop-shadow one
 * the original used — `no-shadow` bans that, and a two-tone stroke is the
 * better answer anyway: it stays legible over a dark control and a white form
 * alike, which a shadow only manages over light.
 */
export function Cursor({ tour }: { tour: Tour }) {
  const frame = useFrame()
  const shotScale = useShotScale()
  const seconds = frame / FPS

  const pose = poseAt(tour, seconds)
  const since = sinceClick(tour, seconds)

  /* Everything inside a Shot is drawn in screenshot pixels and then scaled by
     the camera. Dividing by that scale puts the pointer back at a constant
     canvas size. */
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
      {/* The ripple is centred on the click point and sits under the arrow, so
          the pointer is never obscured by its own feedback. */}
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
        style={{ transform: `scale(${pose.scale.toFixed(4)})`, transformOrigin: "top left" }}
        viewBox="0 0 24 24"
        width={SIZE}
      >
        {/* Two passes: a thick foreground stroke reads as the outline, the
            background fill over it reads as the body. Tokens, so a whitelabel
            repaints the pointer with everything else. */}
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
