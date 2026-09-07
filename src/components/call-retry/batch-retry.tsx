"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SCENARIO_NAME, type RetryConfig } from "@/lib/call-retry-data"
import { RetrySettingsCard } from "@/components/call-retry/retry-settings-card"

/**
 * The same card, seen from a trigger source that inherits it.
 *
 * The inherited state is the one carrying the design risk. Greyed fields read
 * as broken rather than as following the scenario, and the usual escape is to
 * press Override so the form starts working — which is how a batch ends up with
 * its own copy of settings nobody meant to fork. Naming the scenario in the
 * description makes inheriting a state you can read instead of one you flee.
 *
 * So every control stays on screen and every control is dead, Save included.
 * No banner, no explainer, and no description that swaps under a field: the
 * switch that turns editing on is in this card's own header, and a panel of
 * greyed controls under it already says the rest.
 */
export function BatchRetry({
  onOverriddenChange,
  overridden,
  scenarioConfig,
}: {
  onOverriddenChange: (overridden: boolean) => void
  overridden: boolean
  scenarioConfig: RetryConfig
}) {
  /** The batch's own copy, which only exists while the override is on. */
  const [draft, setDraft] = React.useState<RetryConfig>(scenarioConfig)

  return (
    <RetrySettingsCard
      disabled={!overridden}
      onChange={setDraft}
      onSave={() => {
        toast.success("Retry settings saved")
      }}
      /* One row, on the muted inset the house uses in place of a nested card.
         The switch, the words that label it, and the sentence saying which way
         it is currently pointing are one object — which is what it stopped
         being when the switch sat in the header and the sentence sat under the
         title. It leads the fields because it decides whose fields they are. */
      scope={
        <Item variant="muted">
          <ItemContent>
            <ItemTitle>
              <Label htmlFor="batch-override">Override scenario</Label>
            </ItemTitle>
            <ItemDescription>
              {overridden
                ? `This batch has its own retry settings. Changes to ${SCENARIO_NAME} no longer reach it.`
                : `Following the ${SCENARIO_NAME} scenario. Change its retry settings and this batch follows.`}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch
              checked={overridden}
              id="batch-override"
              onCheckedChange={(next) => {
                // Switching on seeds from the scenario; switching off discards
                // whatever the batch had, which is what "inherit" means.
                if (next) setDraft({ ...scenarioConfig })
                onOverriddenChange(next)
              }}
            />
          </ItemActions>
        </Item>
      }
      value={overridden ? draft : scenarioConfig}
    />
  )
}
