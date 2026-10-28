"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import {
  CONFIGURED_ALERTS,
  SEVERITY_ORDER,
  type AlertAnalysis,
  type Detection,
} from "@/lib/mockups/behavioral-alerts-data"
import { ScenarioSettingsIcon } from "@/components/mockups/behavioral-alerts/icons"
import { formatTimeSeconds } from "@/components/mockups/behavioral-alerts/recording-player"
import { Seekable } from "@/components/mockups/behavioral-alerts/seekable"
import {
  SEVERITY_RULE,
  SeverityBadge,
} from "@/components/mockups/behavioral-alerts/severity"

export function AlertDetectionsBody({
  analysis,
  onConfigureAlerts,
  onSeek,
}: {
  analysis: AlertAnalysis
  onConfigureAlerts: () => void
  onSeek: (seconds: number) => void
}) {
  if (analysis.state === "pending") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-4 shrink-0" />
        Analysing this call. Detections appear here when the post-call task
        finishes.
      </p>
    )
  }

  if (analysis.state === "unavailable") {
    return (
      <p className="text-sm text-muted-foreground">
        The call ended before anything was said, so there was no transcript to
        analyse.
      </p>
    )
  }

  if (analysis.state === "unconfigured") {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          This scenario has no flags configured, so nothing was watched for.
        </p>
        <Button
          className="self-start"
          onClick={onConfigureAlerts}
          size="sm"
          variant="outline"
        >
          <ScenarioSettingsIcon />
          Configure flags
        </Button>
      </>
    )
  }

  if (analysis.detections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No configured flag was detected on this call.
      </p>
    )
  }

  const detections = [...analysis.detections].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  )

  return (
    <div className="flex flex-col gap-2">
      {detections.map((detection) => (
        <DetectionRow
          detection={detection}
          key={detection.id}
          onSeek={onSeek}
        />
      ))}
    </div>
  )
}

export function detectionsSummary(analysis: AlertAnalysis) {
  if (analysis.state === "pending") return "Analysing"
  if (analysis.state === "unavailable") return "No transcript"
  if (analysis.state === "unconfigured") return "None configured"
  if (analysis.detections.length === 0) return "None detected"
  return `${analysis.detections.length} detected`
}

function DetectionRow({
  detection,
  onSeek,
}: {
  detection: Detection
  onSeek: (seconds: number) => void
}) {
  const alert = CONFIGURED_ALERTS.find((item) => item.id === detection.alertId)

  return (
    <Seekable
      className="flex gap-3 rounded-lg bg-card p-3"
      label={`Seek to ${formatTimeSeconds(detection.at)}`}
      onActivate={() => {
        onSeek(detection.at)
      }}
    >
      <span
        aria-hidden
        className={cn(
          "w-0.5 shrink-0 rounded-sm",
          SEVERITY_RULE[detection.severity],
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            {alert?.name ?? detection.alertId}
          </span>
          <SeverityBadge severity={detection.severity} />
        </div>

        <blockquote className="rounded-lg bg-muted p-2">
          <p className="text-sm text-foreground" dir="auto">
            &ldquo;{detection.evidence}&rdquo;
          </p>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTimeSeconds(detection.at)}
          </span>
        </blockquote>

        <p className="text-sm text-muted-foreground">{detection.explanation}</p>
      </div>
    </Seekable>
  )
}
