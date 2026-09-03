"use client"

import { Badge } from "@/components/ui/badge"
import type { ScheduleDetail } from "@/lib/conversations-revamp-drawer-data"
import {
  CalendarIcon,
  RequestedIcon,
} from "@/components/conversations-revamp/drawer/icons"

/**
 * How a booking reads once the call has actually run.
 *
 * Same facts as the pre-call panel, past tense and without the controls: the
 * booking cannot be cancelled or rescheduled any more, so a Cancel call button
 * here would be a dead affordance. What is left is the question a reader
 * arrives with — this call was booked, so what was it booked *for*, and did the
 * agent get the brief we meant to give it?
 *
 * Dial attempts stay, because "connected on the second attempt" explains a
 * customer who sounded surprised. Reschedules stay for the same reason: a call
 * that was moved twice is a different conversation from one that was not.
 */
export function CompletedScheduleSummary({
  schedule,
}: {
  schedule: ScheduleDetail
}) {
  const requested = schedule.origin === "requested"

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">
          Booked as {schedule.trigger.toLowerCase()}
        </span>

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
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Fact label="Was due" value={schedule.dialsAt} />
        <Fact
          label="Reschedules used"
          value={`${schedule.reschedules.used} of ${schedule.reschedules.limit}`}
        />
        <Fact
          label="Dial attempts used"
          value={`${schedule.dialAttempts.used} of ${schedule.dialAttempts.limit}`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          Context brief the agent was given
        </span>
        <p className="text-sm leading-relaxed text-foreground">
          {schedule.contextBrief}
        </p>
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="rounded-lg bg-card px-3 py-2 text-sm text-foreground">
        {value}
      </span>
    </div>
  )
}
