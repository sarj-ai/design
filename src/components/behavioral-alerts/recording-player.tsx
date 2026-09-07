"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  DownloadRecordingIcon,
  PauseRecordingIcon,
  PlaybackSpeedIcon,
  PlayRecordingIcon,
} from "@/components/behavioral-alerts/icons"

/**
 * The recording player from the revamped call drawer.
 *
 * The waveform and its transport row live in one tinted box: play and the time
 * readout at the start, and the things you do to the recording rather than to
 * the playhead — speed, download — collected at the end.
 *
 * The real one is wavesurfer.js against the signed URL, so the bars here are
 * static and the colours are the nearest tokens.
 */

const PLAYBACK_RATES = [
  { label: "0.5x speed", value: "0.5" },
  { label: "0.75x speed", value: "0.75" },
  { label: "1x speed (normal)", value: "1" },
  { label: "1.25x speed", value: "1.25" },
  { label: "1.5x speed", value: "1.5" },
  { label: "2x speed", value: "2" },
]

const BARS = 144

/**
 * Deterministic pseudo-noise. The server and the client have to draw the same
 * bars, so this stands in for `Math.random`, which would not.
 */
function noise(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

/**
 * Normalised bar heights, 0–1, the way wavesurfer draws them from the audio.
 *
 * Shaped rather than flat: a slow envelope gives the loud stretches where
 * somebody is talking and the quiet ones between them, and the noise on top
 * keeps neighbouring bars from marching.
 */
const WAVE = Array.from({ length: BARS }, (_, index) => {
  const position = index / BARS
  const envelope = 0.3 + 0.7 * Math.abs(Math.sin(position * Math.PI * 3.7))
  const detail = 0.35 + 0.65 * noise(index)

  return Math.min(1, Math.max(0.1, envelope * detail))
})

export function formatTimeSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60)
    .toString()
    .padStart(2, "0")}`
}

export type RecordingMarker = {
  id: string
  label: string
  /** Seconds into the recording. */
  at: number
  /** The token class the marker is drawn in. */
  tone: string
}

export function RecordingPlayer({
  at = 0,
  duration,
  markers,
  onSeek,
}: {
  /** Where the playhead sits, in seconds. */
  at?: number
  duration: number
  /**
   * Drawn on the waveform at the second each one happened. Here that is one
   * per detection: the moment the quote the analyst lifted was said.
   */
  markers?: RecordingMarker[]
  onSeek: (seconds: number) => void
}) {
  const [playing, setPlaying] = React.useState(false)
  const [rate, setRate] = React.useState("1")

  const played = Math.round((at / duration) * BARS)

  return (
    /* Wave and controls in one tinted box rather than a box with a loose row of
       buttons under it. They are one instrument: the transport moves the
       playhead the wave draws, and the time readout is the same number the
       playhead is at. */
    <div className="flex shrink-0 flex-col overflow-hidden rounded-lg bg-muted">
      <div className="p-4">
        <div
          aria-label="Seek in the recording"
          className="relative flex h-10 cursor-pointer items-center gap-px focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect()
            const ratio = (event.clientX - box.left) / box.width
            onSeek(Math.round(Math.min(Math.max(ratio, 0), 1) * duration))
          }}
          role="button"
          tabIndex={0}
        >
          {/* The bars flex to fill rather than sitting at a fixed width: the
              track spans the panel, and the panel is resizable. If they did
              not, the wave would end partway across while clicking to seek and
              the markers below both still measured the full width — so the
              picture and the positions would disagree. */}
          {Array.from({ length: BARS }, (_, index) => (
            <span
              className={cn(
                "min-w-px flex-1 rounded-sm transition-colors duration-150 ease-out-cubic motion-reduce:transition-none",
                index <= played && at > 0 ? "bg-primary-light" : "bg-border",
              )}
              key={index}
              style={{ height: `${(WAVE[index] * 100).toFixed(1)}%` }}
            />
          ))}

          {/* A detection is anchored to a moment in the call, so the waveform
              is the only place it can honestly be drawn. */}
          {markers?.map((marker) => (
            <Tooltip key={marker.id}>
              <TooltipTrigger
                aria-label={`${marker.label} at ${formatTimeSeconds(marker.at)}`}
                className={cn(
                  "absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-sm",
                  marker.tone,
                )}
                onClick={(event) => {
                  event.stopPropagation()
                  onSeek(marker.at)
                }}
                style={{
                  insetInlineStart: `${(marker.at / duration) * 100}%`,
                }}
              />
              <TooltipContent>
                {marker.label} · {formatTimeSeconds(marker.at)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* One transport row, and every control on it the same height. Play is
          the only filled one, because it is the only thing you press without
          looking. */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <Button
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            setPlaying(!playing)
          }}
          size="icon-sm"
        >
          {playing ? <PauseRecordingIcon /> : <PlayRecordingIcon />}
        </Button>

        <span className="font-mono text-sm text-muted-foreground tabular-nums">
          {formatTimeSeconds(at)} / {formatTimeSeconds(duration)}
        </span>

        <div className="ms-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <PlaybackSpeedIcon />
                {rate}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup onValueChange={setRate} value={rate}>
                {PLAYBACK_RATES.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" variant="ghost">
            <DownloadRecordingIcon />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
