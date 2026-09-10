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

/**
 * Watching a reel in the browser.
 *
 * The player owns the playhead and nothing else — it hands a frame number to
 * `Stage` exactly the way the renderer does. That is the point: there is no
 * "preview version" of a reel that can look different from the exported file,
 * because previewing and exporting differ only in who is counting.
 *
 * Playback derives the frame from elapsed wall-clock time rather than counting
 * rAF ticks, so a dropped frame on a busy machine shows up as a skip and not as
 * the whole reel running slow.
 */
export function ReelPlayer({
  duration,
  children,
}: {
  duration: number
  children: React.ReactNode
}) {
  const [frame, setFrame] = React.useState(0)

  /* Where playback started, and when. Held as state rather than a ref so the
     effect below has it without listing `frame` as a dependency — which would
     tear the loop down and rebuild it on every single frame. `null` is paused. */
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

    /* Pressing play on the last frame replays from the top, which is what the
       button says it will do — it reads "Replay" there. */
    setOrigin({ frame: atEnd ? 0 : frame, at: performance.now() })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* The canvas sits on the muted surface so a white composition has an
          edge without a shadow under it. */}
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

        {/* Tabular so the timecode does not jitter as the digits change. */}
        <span className="w-24 shrink-0 text-end font-mono text-sm tabular-nums text-muted-foreground">
          {timecode(frame)} / {timecode(duration)}
        </span>
      </div>
    </div>
  )
}
