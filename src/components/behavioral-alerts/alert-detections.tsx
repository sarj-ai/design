"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import {
  CONFIGURED_ALERTS,
  SEVERITY_ORDER,
  type AlertAnalysis,
  type Detection,
} from "@/lib/behavioral-alerts-data"
import { ScenarioSettingsIcon } from "@/components/behavioral-alerts/icons"
import { formatTimeSeconds } from "@/components/behavioral-alerts/recording-player"
import { Seekable } from "@/components/behavioral-alerts/seekable"
import {
  SEVERITY_RULE,
  SeverityBadge,
} from "@/components/behavioral-alerts/severity"

/**
 * What the post-call analyst found, as the panel's own section.
 *
 * The three "nothing fired" cases are three different messages rather than one
 * blank panel — "no flag was detected", "no flag is configured" and "this
 * call was never analysed" are three different things to do next.
 */
export function AlertDetectionsBody({
  analysis,
  onConfigureAlerts,
  onSeek,
}: {
  analysis: AlertAnalysis
  /** Opens the scenario the alerts would be configured on. */
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

/** The label the collapsed section header carries, per state. */
export function detectionsSummary(analysis: AlertAnalysis) {
  if (analysis.state === "pending") return "Analysing"
  if (analysis.state === "unavailable") return "No transcript"
  if (analysis.state === "unconfigured") return "None configured"
  if (analysis.detections.length === 0) return "None detected"
  return `${analysis.detections.length} detected`
}

/**
 * One detection, and it seeks.
 *
 * The quote sits on its own surface and the explanation does not, because they
 * carry different weight: one is what the caller said and can be checked
 * against the transcript, the other is the model's reading of it. Rendered as
 * two equal paragraphs a reader has no way to tell which is which — and telling
 * them apart is the entire reason the PRD makes evidence mandatory.
 *
 * Which is also why the row is clickable: pressing it puts the playhead on the
 * quote and brings that turn up in the transcript beside it.
 */
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
      /* No hover tint. The card sits still; the pointer and the focus ring
         are what say it is pressable. */
      className="flex gap-3 rounded-lg bg-card p-3"
      label={`Seek to ${formatTimeSeconds(detection.at)}`}
      onActivate={() => {
        onSeek(detection.at)
      }}
    >
      {/* Severity twice, deliberately: the rule is what a reader sorts the
          list by at a glance, the badge is what they read. */}
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
