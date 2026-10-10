import { Badge } from "@/components/ui/badge"

/**
 * Live as a pill, for the playground list: there it sits among the
 * language chips on a card's second line, so it takes their shape.
 */
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

/**
 * A scenario's status on the index: a live scenario's chip says Live.
 *
 * Live takes the success tint and a dot, because it is the state the reader
 * has to notice before touching anything. Active drops to muted: it is what
 * every scenario in the Active view already is, so in the product it was a
 * green chip on every row saying nothing.
 */
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
