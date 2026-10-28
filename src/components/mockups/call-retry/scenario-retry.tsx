"use client"

import * as React from "react"
import { toast } from "sonner"

import type { RetryConfig } from "@/lib/mockups/call-retry-data"
import { RetrySettingsCard } from "@/components/mockups/call-retry/retry-settings-card"
import { SaveConfirmDialog } from "@/components/mockups/call-retry/save-confirm-dialog"

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
