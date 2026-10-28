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
} from "@/lib/mockups/behavioral-alerts-data"

const SEVERITY_TONE: Record<AlertSeverity, string> = {
  mild: "bg-muted text-muted-foreground",
  moderate: "bg-warning-tint text-warning-tint-foreground",
  severe: "bg-destructive-tint text-destructive-tint-foreground",
}

export const SEVERITY_RULE: Record<AlertSeverity, string> = {
  mild: "bg-border",
  moderate: "bg-warning",
  severe: "bg-destructive",
}

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
