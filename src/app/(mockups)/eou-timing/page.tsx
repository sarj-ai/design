"use client"

import * as React from "react"

import { AppShell } from "@/components/shell/app-shell"
import { GlobalTurnDetection } from "@/components/mockups/eou-timing/global-turn-detection"
import { PersonaTurnTiming } from "@/components/mockups/eou-timing/persona-turn-timing"
import type { WaitWindowValue } from "@/components/mockups/eou-timing/wait-window"
import { MockupShell } from "@/components/shell/mockup-shell"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PERSONA, SAVED_GLOBAL } from "@/lib/mockups/eou-timing-data"

type Home = "global" | "persona"

export default function EouTimingPage() {
  const [home, setHome] = React.useState<Home>("global")

  const [globalWindow, setGlobalWindow] = React.useState<WaitWindowValue>({
    maxWaitSeconds: SAVED_GLOBAL.maxWaitSeconds,
    minWaitSeconds: SAVED_GLOBAL.minWaitSeconds,
  })

  const onGlobal = home === "global"

  return (
    <MockupShell
      title="Design EOU configuration updates independent from backchanneling"
      actions={
        <ToggleGroup
          onValueChange={(next) => {
            if (next) setHome(next as Home)
          }}
          size="sm"
          type="single"
          value={home}
          variant="outline"
        >
          <ToggleGroupItem value="global">Global Settings</ToggleGroupItem>
          <ToggleGroupItem value="persona">
            Persona · {PERSONA.name}
          </ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <AppShell
        active={onGlobal ? "Global Settings" : "Personas"}
        breadcrumb={onGlobal ? "Global Settings" : `Personas · ${PERSONA.name}`}
        onNavigate={(title) => {
          if (title === "Global Settings") setHome("global")
          if (title === "Personas") setHome("persona")
        }}
      >
        <div className="flex flex-1 flex-col p-3 lg:p-4">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <h1 className="text-2xl font-semibold">
              {onGlobal ? "Global settings" : `Edit persona · ${PERSONA.name}`}
            </h1>
            {onGlobal ? (
              <GlobalTurnDetection
                onWindowChange={setGlobalWindow}
                window={globalWindow}
              />
            ) : (
              <PersonaTurnTiming globalWindow={globalWindow} />
            )}
          </div>
        </div>
      </AppShell>
    </MockupShell>
  )
}
