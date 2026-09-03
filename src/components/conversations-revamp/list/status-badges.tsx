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
} from "@/lib/conversations-revamp-list-data"
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
} from "@/components/conversations-revamp/list/icons"

/**
 * Every chip in the table, from one place.
 *
 * Two rules, and they are what keeps a row readable at a glance:
 *
 *   Size    Every chip is a `<Badge>` with no size classes of its own, so they
 *           all share one height, one radius and one text size. The chips used
 *           to be four hand-rolled spans with three paddings and two radii
 *           between them, which is why a row read as five different components.
 *
 *   Colour  Colour means state. Direction and Scenario are categories — what
 *           kind of thing this is, not how it went — so they stay neutral and
 *           tell themselves apart by their icon. The three verdict chips —
 *           Call status, Outcome, Agent outcome — are the only coloured ones
 *           in a row.
 */

/** The readings a chip can carry. Anything else is `neutral`. */
type Tone = "danger" | "neutral" | "scheduled" | "success" | "warning"

const TONE: Record<Tone, string> = {
  danger: "bg-destructive-tint text-destructive-tint-foreground",
  neutral: "bg-muted text-muted-foreground",
  /* Booked for later. Brand tint: deliberate, and not yet the platform's turn. */
  scheduled: "bg-primary-tint text-primary-tint-foreground",
  success: "bg-success-tint text-success-tint-foreground",
  /* Amber: not settled yet — a call still on its way to finishing. It is not a
     failure, and every actual failure in a row is red. */
  warning: "bg-warning-tint text-warning-tint-foreground",
}

/**
 * The one chip. `variant="secondary"` is only there to drop the default
 * primary fill — the tone class supplies the surface and its foreground.
 */
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

/**
 * What the Status column prints.
 *
 * The raw enum has fifteen values, and reading a column of them meant learning
 * which of `timeout`, `expired`, `user_rejected` and `max_duration_reached`
 * were the same kind of bad. They are: the call did not happen. So the chip
 * leads with the state — Queued, Scheduled, Completed, Failed — and keeps the
 * specific cause after a dash, where it explains rather than competes.
 *
 * Four states, four colours, each answering a different question: amber has
 * not finished, brand tint is booked for later, green worked, red did not.
 * A call on the line is amber too, because from the reader's side the only
 * thing that separates it from a queued one is that there is nothing to open
 * yet either way.
 */
const STATUS_DISPLAY: Record<
  CallStatus,
  { label: string; reason: null | string; tone: Tone }
> = {
  cancelled: { label: "Failed", reason: "cancelled", tone: "danger" },
  completed: { label: "Completed", reason: null, tone: "success" },
  dialing: { label: "Queued", reason: "dialing", tone: "warning" },
  expired: { label: "Failed", reason: "expired", tone: "danger" },
  failed: { label: "Failed", reason: null, tone: "danger" },
  /* Its own state, not a cause of being queued. The dash slot carries why a
     call ended the way it did; "on the call" is not that, and calling a live
     call Queued put it back in a line it had already left. */
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
  /** Splits Scheduled in two, since the two are not the same commitment. */
  scheduleOrigin?: ScheduleOrigin
  status: CallStatus
}) {
  const { label, reason, tone } = STATUS_DISPLAY[status]

  /* Scheduled reads the same whether the analyst guessed at the callback or
     the customer asked for one, and they are not the same thing to act on: one
     is a commitment made to a person, the other is a suggestion. The dash slot
     the other statuses use for their cause carries it. */
  const cause =
    status === "scheduled" && scheduleOrigin
      ? SCHEDULE_ORIGIN_LABELS[scheduleOrigin]
      : reason

  return (
    <Chip tone={tone}>
      <StatusIcon status={status} />
      {label}
      {/* The cause rides inside the same chip, dimmed against its own
          foreground, so the column still scans as four states. */}
      {cause ? <span className="opacity-70">– {cause}</span> : null}
    </Chip>
  )
}

/**
 * Did the scenario's goal get met.
 *
 * One axis, two readings and the absence of one. `Unavailable` is neutral on
 * purpose: no verdict is not a bad verdict, and a queued call dressed in red
 * reads as a call that went wrong. The column used to print `success`,
 * `failure` and `error`, which read as three points on a scale and left the
 * reader deciding whether an errored report was worse than a failed one.
 */
/** The table cell shows the verdict; the reason is in its tooltip. */
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

/**
 * Was the agent any use to the person on the line — a different question from
 * whether the goal was met, which is why it is a different column and a
 * different vocabulary. An agent can be helpful on a call whose goal was never
 * reachable, and useless on one that got there anyway.
 */
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

/**
 * What both verdict columns print when there is nothing to report yet.
 *
 * Not a chip: a chip is a reading, and a queued call sitting under two grey
 * pills reads as a call that was judged twice and came back grey. Plain muted
 * text says the same word without competing with the rows that did get a
 * verdict.
 */
function NoVerdict() {
  return <span className="text-sm text-muted-foreground">Unavailable</span>
}

/** A category, so the arrow does the work the colour used to do. */
export function DirectionChip({ direction }: { direction: CallDirection }) {
  return (
    <Chip>
      {direction === "inbound" ? <InboundIcon /> : <OutboundIcon />}
      {direction}
    </Chip>
  )
}

/**
 * A name, not a state. It carries no icon because the name is already the
 * distinguishing thing, and it is the one chip whose width varies with content.
 */
export function ScenarioChip({ scenario }: { scenario: string }) {
  return <Chip className="max-w-50 truncate">{scenario}</Chip>
}
