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

export function StatusBadge({ status }: { status: Status }) {
  const look = LOOK[status]
  return (
    <Badge className={look.className} variant="secondary">
      {look.label}
    </Badge>
  )
}
