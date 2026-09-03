"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  PRIORITY_LABELS,
  SENTIMENT_LABELS,
  SEVERITY_LABELS,
  type AlertPriority,
  type AlertSeverity,
  type Sentiment,
} from "@/lib/behavioral-alerts-data"

/**
 * The three colour-carrying chips on these screens, kept together so the two
 * three-step scales cannot drift apart in tone.
 *
 * Mild is deliberately NOT green. Severity says how bad this call was, and the
 * bottom of that scale is "worth knowing", not "good" — a green Mild next to a
 * red Severe reads as a pass/fail axis, which is the exact reading the whole
 * feature exists to stop the platform giving.
 */

const SEVERITY_TONE: Record<AlertSeverity, string> = {
  mild: "bg-muted text-muted-foreground",
  moderate: "bg-warning-tint text-warning-tint-foreground",
  severe: "bg-destructive-tint text-destructive-tint-foreground",
}

/** The rule down the start edge of a detection card, at full strength. */
export const SEVERITY_RULE: Record<AlertSeverity, string> = {
  mild: "bg-border",
  moderate: "bg-warning",
  severe: "bg-destructive",
}

/**
 * The dot on a call row in the list, at the same three strengths.
 *
 * Tinted by the worst thing detected rather than always red: a call whose only
 * detection is a Positive sentiment moment is marked, and a red dot on it would
 * say the opposite of what it found. Mild takes `muted-foreground` rather than
 * the rule's `border`, which at 8px on a white row is not there at all.
 */
export const SEVERITY_DOT: Record<AlertSeverity, string> = {
  mild: "bg-muted-foreground",
  moderate: "bg-warning",
  severe: "bg-destructive",
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return (
    <Badge className={SEVERITY_TONE[severity]}>
      {SEVERITY_LABELS[severity]}
    </Badge>
  )
}

/**
 * Priority is triage, not alarm — it orders the admin's own list and says
 * nothing about any particular call. So it is one outline chip with a dot that
 * changes, rather than three differently-coloured chips that would read as
 * three severities the moment they sit near a detection.
 *
 * One hue at three opacities rather than three chart slots. High, medium and
 * low are a rank, and DES-174 turned --chart-* into six unrelated hues — on
 * that palette these three dots would be blue, amber and violet, which is a
 * set, not a scale. Ordinal data gets one colour and less of it.
 */
const PRIORITY_DOT: Record<AlertPriority, string> = {
  high: "bg-primary",
  low: "bg-primary/30",
  medium: "bg-primary/60",
}

export function PriorityBadge({ priority }: { priority: AlertPriority }) {
  return (
    <Badge variant="outline">
      <span
        aria-hidden
        className={cn("size-1.5 rounded-4xl", PRIORITY_DOT[priority])}
      />
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}

const SENTIMENT_TONE: Record<Sentiment, string> = {
  angry: "bg-destructive-tint text-destructive-tint-foreground",
  frustrated: "bg-warning-tint text-warning-tint-foreground",
  neutral: "bg-muted text-muted-foreground",
  positive: "bg-success-tint text-success-tint-foreground",
}

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  return (
    <Badge className={SENTIMENT_TONE[sentiment]}>
      {SENTIMENT_LABELS[sentiment]}
    </Badge>
  )
}
