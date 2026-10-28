"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { FPS, timecode } from "@/lib/reels/anim"
import { Stage } from "@/components/reels/stage"
import {
  PauseReelIcon,
  PlayReelIcon,
  RestartIcon,
} from "@/components/reels/icons"

/** The frame derives from wall-clock time, not rAF ticks, so a dropped frame skips instead of slowing the reel. */
export function ReelPlayer({
  duration,
  children,
}: {
  duration: number
  children: React.ReactNode
}) {
  const [frame, setFrame] = React.useState(0)

  // State rather than a ref so the effect needn't depend on `frame`, which would rebuild the loop every frame. `null` is paused.
  const [origin, setOrigin] = React.useState<{
    frame: number
    at: number
  } | null>(null)

  const playing = origin !== null
  const atEnd = frame >= duration - 1

  React.useEffect(() => {
    if (!origin) return

    let raf = 0

    const tick = (now: number) => {
      const next = origin.frame + Math.floor(((now - origin.at) / 1000) * FPS)

      if (next >= duration) {
        setFrame(duration - 1)
        setOrigin(null)
        return
      }

      setFrame(next)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [origin, duration])

  function toggle() {
    if (playing) {
      setOrigin(null)
      return
    }

    setOrigin({ frame: atEnd ? 0 : frame, at: performance.now() })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-muted">
        <Stage frame={frame} duration={duration}>
          {children}
        </Stage>
      </div>

      <div className="flex items-center gap-4">
        <Button
          aria-label={playing ? "Pause" : atEnd ? "Replay" : "Play"}
          onClick={toggle}
          size="icon"
          variant="outline"
        >
          {playing ? (
            <PauseReelIcon />
          ) : atEnd ? (
            <RestartIcon />
          ) : (
            <PlayReelIcon />
          )}
        </Button>

        <Slider
          aria-label="Timeline"
          max={duration - 1}
          min={0}
          onValueChange={([value]) => {
            setOrigin(null)
            setFrame(value)
          }}
          step={1}
          value={[frame]}
        />

        <span className="w-24 shrink-0 text-end font-mono text-sm tabular-nums text-muted-foreground">
          {timecode(frame)} / {timecode(duration)}
        </span>
      </div>
    </div>
  )
}
