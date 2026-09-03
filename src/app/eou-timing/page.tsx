"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { GlobalTurnDetection } from "@/components/eou-timing/global-turn-detection"
import { PersonaTurnTiming } from "@/components/eou-timing/persona-turn-timing"
import type { WaitWindowValue } from "@/components/eou-timing/wait-window"
import { MockupShell } from "@/components/mockup-shell"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PERSONA, SAVED_GLOBAL } from "@/lib/eou-timing-data"

type Home = "global" | "persona"

/**
 * EOU and turn-timing configuration — DES-173.
 *
 * Scoped to the PRD's Solution Requirements and nothing else. Minimum and
 * maximum wait, configurable with a global default and a persona override; the
 * model selector shown with the values it governs; plain-language help; bounded
 * ranges; a warning outside the recommended band; and new-calls-only stated on
 * both surfaces.
 *
 * The PRD puts the controls on two surfaces — Global Settings, and the persona
 * editor that inherits from it. They are two pages in the product, not two
 * views of one, so the switch between them sits in the mockup shell rather than
 * on the page, and the sidebar and breadcrumb move with it.
 */
export default function EouTimingPage() {
  const [home, setHome] = React.useState<Home>("global")

  /* Lifted so the persona surface inherits what global was left at, which is
     the whole relationship the override is expressing. */
  const [globalWindow, setGlobalWindow] = React.useState<WaitWindowValue>({
    maxWaitSeconds: SAVED_GLOBAL.maxWaitSeconds,
    minWaitSeconds: SAVED_GLOBAL.minWaitSeconds,
  })

  const onGlobal = home === "global"

  return (
    <MockupShell
      title="Design EOU configuration updates independent from backchanneling"
      /* The switch is a reviewer control, not a product one — no button in the
         app crosses from Global Settings to a persona editor. Up here it stays
         out of the design it exists to let you compare. */
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
            {/* The page had no title at all — breadcrumb straight into a card.
                One h1 per page, and it names where you are. */}
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
