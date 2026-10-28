"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  SCHEDULE_ORIGIN_LABELS,
  type AgentOutcomeStatus,
  type CallDirection,
  type CallStatus,
  type OutcomeStatus,
  type ScheduleOrigin,
} from "@/lib/mockups/conversations-revamp-list-data"
import {
  CalendarIcon,
  CompletedIcon,
  FailureIcon,
  HelpfulIcon,
  InboundIcon,
  NoticeIcon,
  NotAnsweredIcon,
  NotHelpfulIcon,
  OutboundIcon,
  RunningIcon,
  TimeIcon,
  VoicemailIcon,
  CallOutgoingIcon,
} from "@/components/mockups/conversations-revamp/list/icons"

type Tone = "danger" | "neutral" | "scheduled" | "success" | "warning"

const TONE: Record<Tone, string> = {
  danger: "bg-destructive-tint text-destructive-tint-foreground",
  neutral: "bg-muted text-muted-foreground",
  scheduled: "bg-primary-tint text-primary-tint-foreground",
  success: "bg-success-tint text-success-tint-foreground",
  warning: "bg-warning-tint text-warning-tint-foreground",
}

// `variant="secondary"` only drops the default primary fill; the tone class
// supplies the colours.
function Chip({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode
  className?: string
  tone?: Tone
}) {
  return (
    <Badge className={cn(TONE[tone], className)} variant="secondary">
      {children}
    </Badge>
  )
}

const STATUS_DISPLAY: Record<
  CallStatus,
  { label: string; reason: null | string; tone: Tone }
> = {
  cancelled: { label: "Failed", reason: "cancelled", tone: "danger" },
  completed: { label: "Completed", reason: null, tone: "success" },
  dialing: { label: "Queued", reason: "dialing", tone: "warning" },
  expired: { label: "Failed", reason: "expired", tone: "danger" },
  failed: { label: "Failed", reason: null, tone: "danger" },
  in_progress: { label: "In progress", reason: null, tone: "warning" },
  max_duration_reached: {
    label: "Failed",
    reason: "max duration reached",
    tone: "danger",
  },
  queued: { label: "Queued", reason: null, tone: "warning" },
  ringing: { label: "Queued", reason: "ringing", tone: "warning" },
  scheduled: { label: "Scheduled", reason: null, tone: "scheduled" },
  timeout: { label: "Failed", reason: "not answered", tone: "danger" },
  transferred: { label: "Completed", reason: "transferred", tone: "success" },
  transferring: {
    label: "In progress",
    reason: "transferring",
    tone: "warning",
  },
  user_rejected: { label: "Failed", reason: "user rejected", tone: "danger" },
  voicemail: { label: "Failed", reason: "voicemail", tone: "danger" },
}

function StatusIcon({ status }: { status: CallStatus }) {
  switch (status) {
    case "completed":
      return <CompletedIcon />
    case "in_progress":
    case "dialing":
      return <RunningIcon />
    case "transferring":
    case "transferred":
      return <CallOutgoingIcon />
    case "timeout":
    case "expired":
    case "user_rejected":
    case "cancelled":
      return <NotAnsweredIcon />
    case "queued":
    case "ringing":
      return <TimeIcon />
    case "scheduled":
      return <CalendarIcon />
    case "voicemail":
      return <VoicemailIcon />
    default:
      return <NoticeIcon />
  }
}

export function StatusBadge({
  scheduleOrigin,
  status,
}: {
  scheduleOrigin?: ScheduleOrigin
  status: CallStatus
}) {
  const { label, reason, tone } = STATUS_DISPLAY[status]

  const cause =
    status === "scheduled" && scheduleOrigin
      ? SCHEDULE_ORIGIN_LABELS[scheduleOrigin]
      : reason

  return (
    <Chip tone={tone}>
      <StatusIcon status={status} />
      {label}
      {cause ? <span className="opacity-70">– {cause}</span> : null}
    </Chip>
  )
}

export function OutcomeBadge({ status }: { status: OutcomeStatus }) {
  if (status === "unavailable") return <NoVerdict />

  return status === "met" ? (
    <Chip tone="success">
      <CompletedIcon />
      Met
    </Chip>
  ) : (
    <Chip tone="danger">
      <FailureIcon />
      Not met
    </Chip>
  )
}

export function AgentOutcomeBadge({ status }: { status: AgentOutcomeStatus }) {
  if (status === "unavailable") return <NoVerdict />

  return status === "helpful" ? (
    <Chip tone="success">
      <HelpfulIcon />
      Helpful
    </Chip>
  ) : (
    <Chip tone="danger">
      <NotHelpfulIcon />
      Not helpful
    </Chip>
  )
}

function NoVerdict() {
  return <span className="text-sm text-muted-foreground">Unavailable</span>
}

export function DirectionChip({ direction }: { direction: CallDirection }) {
  return (
    <Chip>
      {direction === "inbound" ? <InboundIcon /> : <OutboundIcon />}
      {direction}
    </Chip>
  )
}

export function ScenarioChip({ scenario }: { scenario: string }) {
  return <Chip className="max-w-50 truncate">{scenario}</Chip>
}
