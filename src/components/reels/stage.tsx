"use client"

import * as React from "react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import { FPS, enter as enterStyle, exit as exitStyle } from "@/lib/reels/anim"

export const CANVAS = { width: 1920, height: 1080 } as const

const FrameContext = React.createContext(0)
const DurationContext = React.createContext(0)

/** The current frame, local to the nearest `<Scene>`. */
export function useFrame(): number {
  return React.useContext(FrameContext)
}

/** How long the nearest `<Scene>` lasts, for exit timing. */
export function useSceneDuration(): number {
  return React.useContext(DurationContext)
}

/** Driven by `scripts/render-reel.mjs`. `flushSync` forces React to commit before `page.evaluate` resolves, so the screenshot always catches the requested frame. */
declare global {
  interface Window {
    __reel?: {
      fps: number
      duration: number
      seek: (frame: number) => void
    }
  }
}

export function Stage({
  frame,
  duration,
  render = false,
  onSeek,
  className,
  children,
}: {
  frame: number
  duration: number
  render?: boolean
  onSeek?: (frame: number) => void
  className?: string
  children: React.ReactNode
}) {
  const box = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)

  // Preview only: measuring in render mode would briefly scale the canvas on mount.
  React.useEffect(() => {
    if (render) return
    const element = box.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      if (width > 0) setScale(Math.min(1, width / CANVAS.width))
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [render])

  // Registered from an effect so it only appears once React can service a seek.
  React.useEffect(() => {
    if (!onSeek) return

    window.__reel = {
      fps: FPS,
      duration,
      seek: (next) => flushSync(() => onSeek(next)),
    }

    return () => {
      delete window.__reel
    }
  }, [duration, onSeek])

  const canvas = (
    <div
      className={cn(
        "relative overflow-hidden bg-background font-sans text-foreground",
        className,
      )}
      data-reel-canvas=""
      style={{
        width: CANVAS.width,
        height: CANVAS.height,
        transform: render ? undefined : `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      <FrameContext.Provider value={frame}>
        <DurationContext.Provider value={duration}>
          {children}
        </DurationContext.Provider>
      </FrameContext.Provider>
    </div>
  )

  if (render) return canvas

  return (
    <div ref={box} className="w-full">
      {/* Reserves the scaled height so the page below does not jump on mount. */}
      <div
        className="relative w-full"
        style={{ height: CANVAS.height * scale }}
      >
        {canvas}
      </div>
    </div>
  )
}

/** Children mount only while the playhead is inside it and see a frame counted from its start. Overlapping scenes cross-dissolve. */
export function Scene({
  from,
  duration,
  className,
  children,
}: {
  from: number
  duration: number
  className?: string
  children: React.ReactNode
}) {
  const frame = React.useContext(FrameContext)
  const local = frame - from

  if (local < 0 || local >= duration) return null

  return (
    <div className={cn("absolute inset-0", className)}>
      <FrameContext.Provider value={local}>
        <DurationContext.Provider value={duration}>
          {children}
        </DurationContext.Provider>
      </FrameContext.Provider>
    </div>
  )
}

export function Appear({
  delay = 0,
  distance = 20,
  exitAt,
  className,
  children,
}: {
  delay?: number
  distance?: number
  /** Frames before the scene ends to start leaving. Omit to stay put. */
  exitAt?: number
  className?: string
  children: React.ReactNode
}) {
  const frame = useFrame()
  const duration = useSceneDuration()

  const inStyle = enterStyle(frame, { delay, distance })
  const outStyle = exitAt
    ? exitStyle(frame, duration, { duration: exitAt })
    : null

  return (
    <div
      className={className}
      style={{
        opacity: outStyle
          ? Math.min(inStyle.opacity, outStyle.opacity)
          : inStyle.opacity,
        transform: outStyle
          ? `${inStyle.transform} ${outStyle.transform}`
          : inStyle.transform,
      }}
    >
      {children}
    </div>
  )
}
