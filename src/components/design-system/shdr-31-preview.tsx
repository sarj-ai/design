"use client"

import { SarjShdr31 } from "@/components/ui/shdr-31-sarj"

/**
 * SHDR-31 at the tuning it arrived with, in the brand purple.
 *
 * The orb carries its own `idle` preset — a shell that holds still while the
 * tumble does the moving. This overrides it whole: ten times the clock, a
 * tighter shell, and a softness that swings, so idle here keeps working
 * instead of settling.
 *
 * Only `idle` is set, because only `idle` was given. The variant's `thinking`
 * and `speaking` presets are still underneath, untouched and unused.
 */
export function Shdr31Preview() {
  return (
    /* Same room the other two orbs get: this is a surface treatment, and at
       small sizes the shell, the godrays and the halo are one bright blob. */
    <div className="flex flex-col items-center py-4">
      <SarjShdr31
        size={420}
        state="idle"
        statePresets={{
          idle: {
            speed: 10,
            sweepRate: 3.88,
            radius: 2.3,
            swell: 2.145,
            warp: 0.95,
            warpFreq: 4.5,
            smoothSwing: 2,
            smoothK: 1.24,
          },
        }}
      />
    </div>
  )
}
