"use client"

import * as React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DETECTION_MODELS, PERSONA, SAVED_GLOBAL } from "@/lib/eou-timing-data"

import { ScopeNoteIcon } from "./icons"
import { WaitWindow, type WaitWindowValue } from "./wait-window"

/**
 * Turn Timing in the persona editor — PRD requirement 2.
 *
 * "A persona inherits the global values until it saves an override. Removing
 * the override restores the global values."
 *
 * The inherited state is the one that carries the design risk. Today it is two
 * greyed number fields and a badge, which reads as broken rather than as
 * following global — so the override button gets pressed to make the form work,
 * not because this persona needs different pacing. Naming the source in the
 * copy makes following global a state you can read rather than one you escape.
 */
export function PersonaTurnTiming({
  globalWindow,
}: {
  globalWindow: WaitWindowValue
}) {
  const [override, setOverride] = React.useState<null | WaitWindowValue>(
    PERSONA.override,
  )
  const overridden = override !== null
  const active = override ?? globalWindow
  const model = DETECTION_MODELS.find(
    (entry) => entry.id === SAVED_GLOBAL.detectionModelId,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Turn Timing</CardTitle>
        <CardDescription>
          {overridden
            ? `${PERSONA.name} waits on its own values. Global changes no longer reach it.`
            : `${PERSONA.name} waits on the global values. Change them globally and this persona follows.`}
        </CardDescription>
        {/* One control, not a badge racing a button. The title cannot label it
            — a bare switch beside "Turn Timing" would read as turning turn
            timing off — so the switch carries its own. Which state you are in
            is already said in the description above, in words. */}
        <CardAction>
          <div className="flex items-center gap-2">
            <Label htmlFor="persona-override">Override global</Label>
            <Switch
              checked={overridden}
              id="persona-override"
              onCheckedChange={(next) =>
                setOverride(next ? { ...globalWindow } : null)
              }
            />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <WaitWindow
          disabled={!overridden}
          idPrefix="persona"
          onChange={setOverride}
          value={active}
        />
        <Alert>
          <ScopeNoteIcon />
          <AlertDescription>
            Detection model: {model?.label} (set globally). Changes apply to new
            calls only.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
