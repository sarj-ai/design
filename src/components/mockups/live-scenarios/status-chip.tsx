import { Badge } from "@/components/ui/badge"

export function LiveBadge() {
  return (
    <Badge
      className="bg-success-tint text-success-tint-foreground"
      variant="secondary"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-success" />
      Live
    </Badge>
  )
}

export function StatusChip({
  live,
  deleted = false,
}: {
  live: boolean
  deleted?: boolean
}) {
  if (deleted) {
    return (
      <Badge className="bg-muted text-muted-foreground" variant="secondary">
        Deleted
      </Badge>
    )
  }

  if (live) return <LiveBadge />

  return (
    <Badge className="bg-muted text-muted-foreground" variant="secondary">
      Active
    </Badge>
  )
}
