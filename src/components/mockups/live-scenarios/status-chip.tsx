import { Badge } from "@/components/ui/badge"

/**
 * A scenario's status, one rule everywhere it shows — the editor, the
 * scenarios index and the playground list: a live scenario's chip says Live.
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

  if (live) {
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

  return (
    <Badge className="bg-muted text-muted-foreground" variant="secondary">
      Active
    </Badge>
  )
}
