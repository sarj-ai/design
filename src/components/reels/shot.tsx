"use client"

import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { FPS, easeInOutCubic, interpolate, type Rect } from "@/lib/reels/anim"
import { camRectAt, type Tour } from "@/lib/reels/cursor"
import { useFrame } from "@/components/reels/stage"

export type { Rect }

/** The shot's current zoom. Children that must keep their size counter-scale by 1/this. */
const ShotScaleContext = React.createContext(1)

export function useShotScale(): number {
  return React.useContext(ShotScaleContext)
}

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
  /** Drive the camera from a scripted tour instead of `origin`/`focus`. */
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
        {/* Unoptimized and eager: the renderer screenshots frame 0 right after load, so a lazy image renders blank. */}
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

/** A ring around a region of the screenshot, in source pixels. */
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

/** A label tied to a region of the screenshot, in source pixels. */
export function Pin({
  rect,
  label,
  side = "bottom",
  at,
}: {
  rect: Rect
  label: string
  /** `end` sits beside the region; use it on dense forms, where below lands on the next field's label. */
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
