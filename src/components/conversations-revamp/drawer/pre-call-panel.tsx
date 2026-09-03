"use client"

import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  type CallLink,
  type CallSpecifics,
  type CallState,
  type ScheduleDetail,
} from "@/lib/conversations-revamp-drawer-data"
import { CancelCallDialog } from "@/components/conversations-revamp/drawer/cancel-call-dialog"
import { LinkedCall } from "@/components/conversations-revamp/drawer/linked-call"
import {
  CalendarIcon,
  QueuedIcon,
  RequestedIcon,
} from "@/components/conversations-revamp/drawer/icons"

/**
 * What the drawer shows for a call that has not run yet.
 *
 * Almost everything the drawer exists to show — recording, transcript, outcome,
 * insights, collected data — is null before a call happens. Rendering those
 * sections anyway would be a panel of empty headers, so the pre-call drawer
 * carries only what actually exists.
 *
 * For a queued call that is nothing at all: it is in the line, and the only
 * honest thing to say is what it is waiting for. A scheduled call is the one
 * with something to read — it was booked by something, and why it was booked is
 * the whole reason someone opens it before it runs.
 *
 * A scheduled call becomes a queued one when its time arrives, and at that
 * point it keeps this section: the booking is still the reason it exists.
 * `state` is what decides, not the section, so that transition costs nothing
 * here.
 */
export function PreCallPanel({
  onCancel,
  specifics,
  state,
}: {
  /** Confirmed cancellation, handed up so the row's status can follow. */
  onCancel: () => void
  specifics: CallSpecifics
  state: Exclude<CallState, "complete">
}) {
  if (state === "queued") {
    return (
      <div className="flex h-full flex-col p-1">
        <Empty className="rounded-lg bg-muted">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <QueuedIcon />
            </EmptyMedia>
            <EmptyTitle>Waiting to dial</EmptyTitle>
            <EmptyDescription>
              This call is in the queue. There is no recording, transcript or
              outcome until it runs — they appear here once it does.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3 p-1">
      {specifics.schedule ? (
        <ScheduledCallSection
          onCancel={onCancel}
          ranFrom={specifics.ranFrom}
          schedule={specifics.schedule}
        />
      ) : null}

      <Empty className="rounded-lg bg-muted">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <QueuedIcon />
          </EmptyMedia>
          <EmptyTitle>Nothing recorded yet</EmptyTitle>
          <EmptyDescription>
            The recording, transcript, outcome and collected data appear here
            after the call runs.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

/** Why this call was booked, where it came from, when it dials, how to stop it. */
export function ScheduledCallSection({
  onCancel,
  ranFrom,
  schedule,
}: {
  onCancel: () => void
  ranFrom?: CallLink
  schedule: ScheduleDetail
}) {
  const requested = schedule.origin === "requested"

  return (
    <div className="flex shrink-0 flex-col gap-4 rounded-lg bg-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-primary">
          <CalendarIcon className="size-4" />
          Scheduled call
        </span>

        {/* Origin sits beside the trigger rather than inside the brief's
            footnote. A call the analyst guessed at and a call the customer
            asked for in words carry different weight, and the reader decides
            how much to trust the brief below before they read it. */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={
              requested
                ? "bg-success-tint text-success-tint-foreground"
                : "bg-warning-tint text-warning-tint-foreground"
            }
            variant="secondary"
          >
            {requested ? <RequestedIcon /> : <CalendarIcon />}
            {requested ? "Customer requested" : "Inferred follow-up"}
          </Badge>
          <Badge>{schedule.trigger}</Badge>
        </div>
      </div>

      {ranFrom ? <LinkedCall label="Booked from" link={ranFrom} /> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Dials" value={schedule.dialsAt} />
        {/* Two limits, because the PRD sets two and they run out
            independently: a booking can be on its last reschedule with both
            dial attempts still in hand. */}
        <Field
          label="Reschedules"
          value={`${schedule.reschedules.used} of ${schedule.reschedules.limit}`}
        />
        <Field
          label="Dial attempts"
          value={`${schedule.dialAttempts.used} of ${schedule.dialAttempts.limit}`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Context brief</span>
        <p className="text-sm leading-relaxed font-medium text-foreground">
          {schedule.contextBrief}
        </p>
      </div>

      {/* Only the inferred brief gets a footnote. It is a guess and has to say
          so. A requested one is the customer's own words — the badge above
          already says that, and a confidence score under it would invent doubt
          that is not there. */}
      {requested ? null : (
        <p className="rounded-lg bg-card px-3 py-2 text-xs text-muted-foreground">
          Inferred by post-call analysis · {schedule.confidence}
        </p>
      )}

      <CancelCallDialog onConfirm={onCancel} />
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="rounded-lg bg-card px-3 py-2 text-sm text-foreground">
        {value}
      </span>
    </div>
  )
}
