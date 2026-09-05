"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { FluidOrb, type FluidOrbState } from "@/components/ui/fluid-orb"

/**
 * The agent's voice states on one orb, with the way to move between them.
 *
 * The states are the four the call loop actually has, and they read as one
 * hue at four depths rather than four colours — the agent has not changed,
 * it has moved on. The colours live in the primitive, keyed by state name, so
 * nothing here writes a colour at all.
 */
const STATES: { id: FluidOrbState; label: string }[] = [
  { id: "idle", label: "Idle" },
  { id: "listening", label: "Listening" },
  { id: "thinking", label: "Thinking" },
  { id: "speaking", label: "Speaking" },
]

export function OrbPreview() {
  const [state, setState] = React.useState<FluidOrbState>("listening")

  return (
    /* Big, because the whole component is a surface treatment: at thumbnail
       size the churn, the crest and the rings are all one purple smudge, and
       the four states cannot be told apart at all. */
    <div className="flex flex-col items-center gap-8 py-4">
      <FluidOrb size={320} state={state} />

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
