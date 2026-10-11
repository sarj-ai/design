"use client"

import * as React from "react"

/**
 * The two cues the PRD asks for: a distinct tone when capture starts and
 * another when it stops. Real Web Audio, so a reviewer hears the difference —
 * a rising pair to start, a single lower note to stop. A browser that blocks
 * audio just stays silent.
 */
export function playTone(kind: "start" | "stop") {
  try {
    const context = new AudioContext()
    const notes = kind === "start" ? [660, 990] : [520]
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const at = context.currentTime + index * 0.12
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.2, at + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.11)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(at)
      oscillator.stop(at + 0.12)
    })
  } catch {
    /* No audio here; the visible state still changes. */
  }
}

/**
 * Pretend playback: plays for `seconds`, then stops on its own. The mockup
 * has no audio to play, but play turning into pause and back is the part a
 * reviewer has to see.
 */
export function usePlayback(seconds: number) {
  const [playing, setPlaying] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setPlaying(false)
  }, [])

  const play = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setPlaying(true)
    timer.current = setTimeout(() => setPlaying(false), seconds * 1000)
  }, [seconds])

  React.useEffect(() => stop, [stop])

  return { playing, toggle: playing ? stop : play, play, stop }
}

export function formatSeconds(seconds: number) {
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}
