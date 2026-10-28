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
import { SCENARIO_NAME, type RetryConfig } from "@/lib/mockups/call-retry-data"
import { RetrySettingsCard } from "@/components/mockups/call-retry/retry-settings-card"

export function BatchRetry({
  onOverriddenChange,
  overridden,
  scenarioConfig,
}: {
  onOverriddenChange: (overridden: boolean) => void
  overridden: boolean
  scenarioConfig: RetryConfig
}) {
  const [draft, setDraft] = React.useState<RetryConfig>(scenarioConfig)

  return (
    <RetrySettingsCard
      disabled={!overridden}
      onChange={setDraft}
      onSave={() => {
        toast.success("Retry settings saved")
      }}
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
