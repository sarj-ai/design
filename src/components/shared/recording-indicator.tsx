"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/** Silence keeps a sliver of every bar, so the mark never empties. */
const FLOOR = 0.2

const SILENCE = [0, 0, 0, 0]

/** The static shape shown under reduced motion: a voice at rest. */
const STILL = [0.35, 0.6, 0.85, 0.6, 0.35]

/** Four bands become five bars, mirrored about the middle one. */
function toBars([low = 0, mid = 0, high = 0, top = 0]: readonly number[]) {
  const loud = Math.max(low, mid)
  /* Loud, the shape is an arch — about 1, 0.7, 0.4 from the middle out. */
  const inner = 0.7 * loud + 0.3 * high
  const outer = 0.4 * loud + 0.3 * top
  return [outer, inner, loud, inner, outer]
}

export function RecordingIndicator({
  levels,
  className,
}: {
  /** Four bands, 0–1, low frequencies first. */
  levels: readonly number[]
  className?: string
}) {
  const reduce = useReducedMotion()
  const bars = reduce ? STILL : toBars(levels)

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center gap-0.5 rounded-full bg-destructive-tint",
        className,
      )}
    >
      {bars.map((level, bar) => (
        <span
          className="h-3.5 w-0.5 origin-center rounded-full bg-destructive transition-transform duration-100 ease-out-cubic motion-reduce:transition-none"
          key={bar}
          style={{
            transform: `scaleY(${FLOOR + (1 - FLOOR) * clamp(level)})`,
          }}
        />
      ))}
    </span>
  )
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

/** Fake speech-like levels for places that must not ask for the microphone. */
export function useSimulatedLevels(active: boolean) {
  const [levels, setLevels] = React.useState<number[]>(SILENCE)

  React.useEffect(() => {
    if (!active) return
    const weight = [0.6, 1, 0.85, 0.5]
    let envelope = 0
    let target = 0.8
    const timer = setInterval(() => {
      if (Math.random() < 0.28) {
        target = Math.random() < 0.18 ? 0.05 : 0.45 + Math.random() * 0.55
      }
      envelope += (target - envelope) * 0.5
      setLevels(weight.map((w) => envelope * w * (0.7 + Math.random() * 0.3)))
    }, 90)
    return () => clearInterval(timer)
  }, [active])

  return active ? levels : SILENCE
}

// Bin ranges over the voice band (~90 Hz to 4 kHz) for a 256-point FFT, computed from the context's real sample rate.
const BAND_EDGES_HZ = [90, 350, 900, 2000, 4000]

/* Byte levels map -85 dB to 0 and -25 dB to 255: a normal speaking voice at
   arm's length fills most of the range, and room tone sits near the floor. */
const MIN_DB = -85
const MAX_DB = -25

type MicrophoneState = "idle" | "asking" | "live" | "unavailable"

/** The microphone's level in four bands while `active`. Activate it at the countdown, not the first recorded frame, so the permission prompt never eats into the take. */
export function useMicrophoneLevels(active: boolean) {
  const [levels, setLevels] = React.useState<number[]>(SILENCE)
  const [state, setState] = React.useState<MicrophoneState>("idle")

  React.useEffect(() => {
    if (!active) return
    let cancelled = false
    let frame = 0
    let stream: MediaStream | null = null
    let context: AudioContext | null = null

    const start = async () => {
      setState("asking")
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        if (!cancelled) setState("unavailable")
        return
      }
      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      context = new AudioContext()
      /* A context made after an await has lost the click that allowed
         audio, and some browsers start it suspended — reading nothing. */
      await context.resume().catch(() => undefined)
      if (cancelled) return
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.6
      analyser.minDecibels = MIN_DB
      analyser.maxDecibels = MAX_DB
      context.createMediaStreamSource(stream).connect(analyser)

      const binWidth = context.sampleRate / analyser.fftSize
      const bands = BAND_EDGES_HZ.slice(0, -1).map((low, index) => [
        Math.max(1, Math.floor(low / binWidth)),
        Math.max(2, Math.ceil(BAND_EDGES_HZ[index + 1] / binWidth)),
      ])
      const bins = new Uint8Array(analyser.frequencyBinCount)

      setState("live")
      const read = () => {
        analyser.getByteFrequencyData(bins)
        setLevels(
          bands.map(([from, to]) => {
            let sum = 0
            for (let bin = from; bin < to; bin++) sum += bins[bin]
            return sum / (to - from) / 255
          }),
        )
        frame = requestAnimationFrame(read)
      }
      read()
    }

    void start()

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((track) => track.stop())
      void context?.close()
      setLevels(SILENCE)
      setState("idle")
    }
  }, [active])

  return { levels: active ? levels : SILENCE, state: active ? state : "idle" }
}
