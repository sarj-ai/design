"use client"

import * as React from "react"
import { toast } from "sonner"

import type { RetryConfig } from "@/lib/call-retry-data"
import { RetrySettingsCard } from "@/components/call-retry/retry-settings-card"
import { SaveConfirmDialog } from "@/components/call-retry/save-confirm-dialog"

/**
 * The scenario's retry configuration — the default every trigger source reads.
 *
 * Saving is where the "global" in the PRD's title becomes visible: this is the
 * one screen whose Save moves calls that are already waiting, on sources nobody
 * is looking at. So it is the one screen that confirms before it does.
 */
export function ScenarioRetry({
  config,
  onConfigChange,
  queued,
  scheduled,
}: {
  config: RetryConfig
  onConfigChange: (config: RetryConfig) => void
  queued: number
  scheduled: number
}) {
  const [confirming, setConfirming] = React.useState(false)

  return (
    <>
      <RetrySettingsCard
        description="Every trigger source uses these settings unless it overrides them."
        onChange={onConfigChange}
        onSave={() => {
          // Nothing is waiting, so there is nothing to confirm. A dialog whose
          // whole content is two counts has nothing to say when both are zero.
          if (queued + scheduled === 0) {
            toast.success("Retry settings saved")
            return
          }
          setConfirming(true)
        }}
        value={config}
      />

      <SaveConfirmDialog
        onConfirm={() => {
          toast.success("Retry settings saved")
        }}
        onOpenChange={setConfirming}
        open={confirming}
        queued={queued}
        scheduled={scheduled}
      />
    </>
  )
}
