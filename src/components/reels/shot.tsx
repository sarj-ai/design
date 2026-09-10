"use client"

import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { FPS, easeInOutCubic, interpolate, type Rect } from "@/lib/reels/anim"
import { camRectAt, type Tour } from "@/lib/reels/cursor"
import { useFrame } from "@/components/reels/stage"

/* `Rect` lives in the kernel — the cursor engine needs it too, and a lib
   importing a component would be backwards. Re-exported so a composition can
   keep getting it from the component it uses it with. */
export type { Rect }

/**
 * The shot's current zoom, for children that must not scale with it.
 *
 * A cursor drawn inside the camera transform would double in size when the
 * camera doubles, which is wrong — a real pointer keeps its size while the UI
 * behind it grows. Children counter-scale by 1/this.
 */
const ShotScaleContext = React.createContext(1)

export function useShotScale(): number {
  return React.useContext(ShotScaleContext)
}

/**
 * A screenshot of the real product, with a camera on it.
 *
 * This is the component the whole system exists to serve. The previous release
 * engine drew abstract motifs — a shield, a bolt, a cartoon canary — and a
 * viewer could not tell from any of them what had actually shipped. A reel
 * shows the product.
 *
 * The camera matters as much as the picture. A 2880px-wide screenshot dropped
 * whole onto a 1080p canvas renders every control at about a third of the size
 * it has on a real screen, so nobody can read the thing the release is about.
 * `focus` fixes that: name the region that matters in source pixels and the
 * shot pushes into it, so the feature fills the frame while the surrounding UI
 * establishes where you are.
 *
 * Source images should be captured at 2x. Downscaling a 2x shot into a 1080p
 * frame stays sharp; upscaling a 1x shot to fill the frame does not.
 */
export function Shot({
  src,
  alt,
  width,
  height,
  frameWidth,
  focus,
  origin,
  at,
  camera,
  className,
  children,
}: {
  src: string
  /** What the screenshot shows. Empty when a caption already says it. */
  alt: string
  /** Intrinsic pixels of the source file. */
  width: number
  height: number
  /** How wide the shot sits on the 1920x1080 canvas. */
  frameWidth: number
  /** Region to end on. Omitted, the shot holds the full screen. */
  focus?: Rect
  /** Region to start from. Defaults to the whole screenshot. */
  origin?: Rect
  /** `[startFrame, endFrame]` for the move. Defaults to a slow four seconds. */
  at?: readonly [number, number]
  /**
   * Drive the camera from a scripted tour instead of `origin`/`focus`.
   *
   * One script then owns both the pointer and the frame, which is the whole
   * reason a tour reads as someone using the product: the camera follows the
   * hand, because they are the same timeline.
   */
  camera?: Tour
  className?: string
  /** `Spotlight`, `Pin` and `Cursor`, positioned in source pixels. */
  children?: React.ReactNode
}) {
  const frame = useFrame()

  const full: Rect = { x: 0, y: 0, width, height }
  const from = origin ?? full
  const to = focus ?? from
  const [start, end] = at ?? [0, 120]

  /* Lerp the whole rect, then solve the transform once. Interpolating the
     rect rather than the transform keeps the motion honest: the camera travels
     in the screenshot's own coordinates, so a push into a corner arcs the way a
     camera does instead of skewing. */
  const lerp = (a: number, b: number) =>
    interpolate(frame, [start, end], [a, b], { easing: easeInOutCubic })

  const rect: Rect = camera
    ? camRectAt(camera, frame / FPS)
    : {
        x: lerp(from.x, to.x),
        y: lerp(from.y, to.y),
        width: lerp(from.width, to.width),
        height: lerp(from.height, to.height),
      }

  const frameHeight = Math.round(frameWidth * (height / width))

  /* Cover: the named region always fills the frame, never letterboxes. */
  const scale = Math.max(frameWidth / rect.width, frameHeight / rect.height)
  const translateX = frameWidth / 2 - (rect.x + rect.width / 2) * scale
  const translateY = frameHeight / 2 - (rect.y + rect.height / 2) * scale

  return (
    /* Radius and an edge, deliberately no padding — a div with all three is a
       Card rebuilt by hand, and `use-ui-primitives` is right to reject it. A
       screenshot needs the edge because the product is white on a white
       canvas, and `no-shadow` means it cannot be a drop shadow. */
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card",
        className,
      )}
      style={{ width: frameWidth, height: frameHeight }}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width,
          height,
          transform: `translate(${translateX.toFixed(3)}px, ${translateY.toFixed(
            3,
          )}px) scale(${scale.toFixed(5)})`,
          transformOrigin: "top left",
        }}
      >
        {/* Unoptimized and eager: the renderer screenshots frame 0 moments
            after load, so a lazy or still-optimizing image renders as a blank
            panel in the finished video. */}
        <Image
          alt={alt}
          src={src}
          width={width}
          height={height}
          priority
          unoptimized
          className="block"
        />
        <ShotScaleContext.Provider value={scale}>
          {children}
        </ShotScaleContext.Provider>
      </div>
    </div>
  )
}

/**
 * A ring around a region of the screenshot — "this control, right here".
 *
 * Sits inside the camera transform, so it tracks the region as the shot pushes
 * in. Its stroke scales with the zoom, which is correct: it is drawn on the
 * screenshot, not on the canvas.
 */
export function Spotlight({
  rect,
  at,
  className,
}: {
  rect: Rect
  /** `[startFrame, endFrame]` to draw it in. */
  at?: readonly [number, number]
  className?: string
}) {
  const frame = useFrame()
  const [start, end] = at ?? [0, 10]

  return (
    <div
      className={cn(
        "absolute rounded-md ring-2 ring-primary ring-offset-2",
        className,
      )}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        opacity: interpolate(frame, [start, end], [0, 1]),
      }}
    />
  )
}

/**
 * A label tied to a region of the screenshot.
 *
 * Placed in source pixels like `Spotlight`, so it stays attached to what it
 * names. Keep the text to a few words — this is a pointer, not a caption. The
 * caption is the scene's own headline.
 */
export function Pin({
  rect,
  label,
  side = "bottom",
  at,
}: {
  rect: Rect
  label: string
  /** `end` puts the label beside the region — the one that survives a dense
   *  form, where anything below the field lands on the next field's label. */
  side?: "top" | "bottom" | "end"
  at?: readonly [number, number]
}) {
  const frame = useFrame()
  const [start, end] = at ?? [0, 12]
  const offset = 24

  const placement =
    side === "end"
      ? {
          left: rect.x + rect.width + offset,
          top: rect.y + rect.height / 2,
          settle: "translateY(-50%)",
          slide: "translateX",
          from: -10,
        }
      : side === "top"
        ? {
            left: rect.x,
            top: rect.y - offset,
            settle: "translateY(-100%)",
            slide: "translateY",
            from: 8,
          }
        : {
            left: rect.x,
            top: rect.y + rect.height + offset,
            settle: "",
            slide: "translateY",
            from: -8,
          }

  return (
    <div
      className="absolute flex"
      style={{
        left: placement.left,
        top: placement.top,
        width: side === "end" ? undefined : rect.width,
        justifyContent: side === "end" ? undefined : "center",
        opacity: interpolate(frame, [start, end], [0, 1]),
        transform: `${placement.settle} ${placement.slide}(${interpolate(
          frame,
          [start, end],
          [placement.from, 0],
        ).toFixed(3)}px)`,
      }}
    >
      <span className="rounded-full bg-primary px-4 py-1.5 text-reel-body font-semibold whitespace-nowrap text-primary-foreground">
        {label}
      </span>
    </div>
  )
}
