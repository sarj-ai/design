"use client"

import * as React from "react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import { FPS, enter as enterStyle, exit as exitStyle } from "@/lib/reels/anim"

/** The canvas. Every reel is authored against these exact pixels. */
export const CANVAS = { width: 1920, height: 1080 } as const

/**
 * The frame a component should draw itself at.
 *
 * `<Scene>` shifts this, so a component inside a scene always sees a frame
 * counted from its own start — a scene can be moved along the timeline without
 * touching a single number inside it.
 */
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

/**
 * The handle `scripts/render-reel.mjs` drives.
 *
 * The renderer never reloads the page — it mounts once, then seeks and
 * screenshots. `flushSync` is what makes that safe: it forces React to commit
 * before `page.evaluate` resolves, so the screenshot that follows can only ever
 * catch the frame that was asked for. Without it the renderer races the
 * scheduler and drops frames at random, which looks like a stutter in the
 * finished video and is close to impossible to diagnose from the MP4.
 */
declare global {
  interface Window {
    __reel?: {
      fps: number
      duration: number
      seek: (frame: number) => void
    }
  }
}

/**
 * The reel canvas.
 *
 * In preview it scales to fit its container, so a 1920x1080 composition can be
 * watched inside a normal browser window. In render mode the transform is off
 * and the canvas is exactly 1:1, because a scaled screenshot is a resampled
 * screenshot and the text goes soft.
 */
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

  /* Preview only. In render mode the canvas must stay 1:1, and measuring would
     briefly scale it on mount — a soft first frame. */
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

  /* Publish the render handle. Registered from an effect so it only ever
     appears once React can actually service a seek. */
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
      {/* Reserves the scaled height, so the page below does not jump as the
          canvas is measured and scaled on mount. */}
      <div
        className="relative w-full"
        style={{ height: CANVAS.height * scale }}
      >
        {canvas}
      </div>
    </div>
  )
}

/**
 * A slice of the timeline.
 *
 * Children mount only while the playhead is inside it, and see a frame counted
 * from the scene's own start. Scenes are free to overlap — give the next one an
 * earlier `from` than the previous one's end and they cross-dissolve, which is
 * how a reel gets a continuous feel instead of a slideshow of hard cuts.
 */
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

/**
 * The common entrance, so a composition does not spell out the same three
 * lines for every element on screen.
 *
 * Anything that wants a different move reaches for `interpolate` directly —
 * that is the point of the kernel, and the reason reels do not all look alike.
 */
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
