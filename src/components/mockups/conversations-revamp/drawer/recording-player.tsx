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
  DownloadIcon,
  PauseIcon,
  PlayCallIcon,
  SpeedIcon,
} from "@/components/mockups/conversations-revamp/drawer/icons"

const PLAYBACK_RATES = [
  { label: "0.5x speed", value: "0.5" },
  { label: "0.75x speed", value: "0.75" },
  { label: "1x speed (normal)", value: "1" },
  { label: "1.25x speed", value: "1.25" },
  { label: "1.5x speed", value: "1.5" },
  { label: "2x speed", value: "2" },
]

const BARS = 144

// Deterministic so server and client draw the same bars; Math.random would not.
function noise(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

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

export function RecordingPlayer({
  actions,
  at = 0,
  duration,
  flags,
  onFlagClick,
  onSeek,
}: {
  actions?: React.ReactNode
  at?: number
  duration: number
  flags?: { id: string; label: string; timestampMs: number; tone: string }[]
  onFlagClick?: (seconds: number) => void
  onSeek?: (seconds: number) => void
}) {
  const [playing, setPlaying] = React.useState(false)
  const [rate, setRate] = React.useState("1")

  const played = Math.round((at / duration) * BARS)

  return (
    <div className="flex shrink-0 flex-col overflow-hidden rounded-lg bg-muted">
      <div className="p-4">
        <div
          aria-label={onSeek ? "Seek in the recording" : undefined}
          className={cn(
            "relative flex h-10 items-center gap-px",
            onSeek &&
              "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          )}
          onClick={
            onSeek
              ? (event) => {
                  const box = event.currentTarget.getBoundingClientRect()
                  const ratio = (event.clientX - box.left) / box.width
                  onSeek(Math.round(Math.min(Math.max(ratio, 0), 1) * duration))
                }
              : undefined
          }
          role={onSeek ? "button" : undefined}
          tabIndex={onSeek ? 0 : undefined}
        >
          {/* Bars must fill the track: seeking and the flag markers are
             measured against its full width. */}
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

          {flags?.map((flag) => {
            const seconds = Math.round(flag.timestampMs / 1000)

            return (
              <Tooltip key={flag.id}>
                <TooltipTrigger
                  aria-label={`${flag.label} at ${formatTimeSeconds(seconds)}`}
                  className={cn(
                    "absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-sm",
                    flag.tone,
                  )}
                  onClick={(event) => {
                    event.stopPropagation()
                    onFlagClick?.(seconds)
                  }}
                  style={{ insetInlineStart: `${(seconds / duration) * 100}%` }}
                />
                <TooltipContent>
                  {flag.label} · {formatTimeSeconds(seconds)}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <Button
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            setPlaying(!playing)
          }}
          size="icon-sm"
        >
          {playing ? <PauseIcon /> : <PlayCallIcon />}
        </Button>

        <span className="font-mono text-sm text-muted-foreground tabular-nums">
          {formatTimeSeconds(at)} / {formatTimeSeconds(duration)}
        </span>

        <div className="ms-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <SpeedIcon />
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

          {actions}

          <Button size="sm" variant="ghost">
            <DownloadIcon />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
