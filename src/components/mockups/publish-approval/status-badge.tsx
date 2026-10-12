import { Badge } from "@/components/ui/badge"
import type { Status } from "@/lib/mockups/publish-approval-data"

const LOOK: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "In review",
    className: "bg-warning-tint text-warning-tint-foreground",
  },
  approved: {
    label: "Approved",
    className: "bg-success-tint text-success-tint-foreground",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive-tint text-destructive-tint-foreground",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-muted text-muted-foreground",
  },
}

/**
 * Where a request is. "In review" is the short name for waiting on an
 * approval, short because it shares a table cell with Live. It takes the
 * warning tint because it is the one a reader has to act on or wait for;
 * Withdrawn is muted because nothing follows from it.
 */
export function StatusBadge({ status }: { status: Status }) {
  const look = LOOK[status]
  return (
    <Badge className={look.className} variant="secondary">
      {look.label}
    </Badge>
  )
}
