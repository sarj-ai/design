"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { MeshOrb, type MeshOrbState } from "@/components/ui/mesh-orb"

/**
 * The same four voice states, on the softer of the two orbs.
 *
 * Kept beside FluidOrb rather than replacing it: the two are one decision — a
 * look — and the only way to make it is to watch both run the same states.
 * The colours live in the primitive, keyed by state name, so nothing here
 * writes a colour at all.
 */
const STATES: { id: MeshOrbState; label: string }[] = [
  { id: "idle", label: "Idle" },
  { id: "listening", label: "Listening" },
  { id: "thinking", label: "Thinking" },
  { id: "speaking", label: "Speaking" },
]

export function MeshOrbPreview() {
  const [state, setState] = React.useState<MeshOrbState>("listening")

  return (
    /* Big, because the whole component is a surface treatment: at thumbnail
       size the blend collapses into one flat purple and the four states
       cannot be told apart at all. */
    <div className="flex flex-col items-center gap-8 py-4">
      <MeshOrb size={320} state={state} />

      <ButtonGroup>
        {STATES.map((entry) => (
          <Button
            key={entry.id}
            onClick={() => setState(entry.id)}
            size="sm"
            variant={entry.id === state ? "default" : "outline"}
          >
            {entry.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}
