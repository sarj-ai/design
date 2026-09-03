"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  SOURCE_LABELS,
  isFileSource,
  sourceHref,
  type Source,
} from "@/lib/knowledge-base-data"
import {
  DownloadIcon,
  FailedIcon,
  ReadyIcon,
  RemoveIcon,
} from "@/components/knowledge-base/icons"

/**
 * What the knowledge base is made of.
 *
 * The status column is the part that is new. Pasted text was live the moment
 * it was saved; a document has to have its text pulled out first, once, and
 * that can fail — so a row says whether the agent can query it yet, and when
 * it cannot, why.
 *
 * Every row can also be opened, each in the way that suits what it is: a URL
 * goes to the page, pasted text opens what was saved, and a document hands the
 * original file back.
 */
export function SourceTable({
  sources,
  onRemove,
}: {
  sources: Source[]
  onRemove: (id: string) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="font-semibold text-foreground">Name</TableHead>
          <TableHead className="font-semibold text-foreground">
            Added by
          </TableHead>
          <TableHead className="font-semibold text-foreground">Added</TableHead>
          <TableHead className="font-semibold text-foreground">
            Status
          </TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {sources.map((source) => (
          <TableRow key={source.id}>
            <TableCell>
              <div className="flex min-w-0 flex-col gap-0.5">
                <SourceName source={source} />
                <span
                  className={
                    source.problem
                      ? "text-xs text-destructive"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {source.problem ??
                    source.url ??
                    [SOURCE_LABELS[source.kind], source.size]
                      .filter((part) => part && part !== "—")
                      .join(" · ")}
                </span>
              </div>
            </TableCell>

            <TableCell className="text-muted-foreground">
              {source.addedBy}
            </TableCell>

            <TableCell className="text-muted-foreground">
              {source.addedAt}
            </TableCell>

            <TableCell>
              <StatusBadge source={source} />
            </TableCell>

            <TableCell>
              <div className="flex items-center justify-end gap-1">
                {/* The original is kept whatever happened to the extraction, so
                    a document that could not be read is still downloadable —
                    often the point at which someone wants it back. */}
                {isFileSource(source.kind) ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Download ${source.name}`}
                  >
                    <DownloadIcon />
                  </Button>
                ) : null}

                <RemoveSource
                  source={source}
                  onRemove={() => onRemove(source.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * Taking something out, with a step in between.
 *
 * A row is one trash icon away from the rows either side of it, and what it
 * removes is not recoverable from this screen — a file has to be uploaded
 * again, typed text has to be typed again. So the click asks first, and the
 * copy carries what actually changes: the agent stops being able to look this
 * up mid-call.
 */
function RemoveSource({
  source,
  onRemove,
}: {
  source: Source
  onRemove: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${source.name}`}
        >
          <RemoveIcon />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove <span dir="auto">{source.name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            It comes out of this knowledge base and the agent stops being able
            to look it up. Putting it back means adding it again.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onRemove}>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * The name, and what opening it means for that kind of source.
 *
 * A document is not a link — its original comes back through Download in the
 * actions column, so its name stays plain rather than offering a click that
 * would have to do the same thing twice.
 */
function SourceName({ source }: { source: Source }) {
  if (source.kind === "url" && source.url) {
    return (
      <a
        href={sourceHref(source.url)}
        target="_blank"
        rel="noreferrer"
        className="w-fit font-medium underline-offset-4 hover:underline"
      >
        {source.name}
      </a>
    )
  }

  if (source.kind === "text") {
    return <TextPreview source={source} />
  }

  return <span className="font-medium">{source.name}</span>
}

/** Pasted text has no page to open, so opening it shows what was saved. */
function TextPreview({ source }: { source: Source }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-fit text-start font-medium underline-offset-4 hover:underline"
        >
          {source.name}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{source.name}</DialogTitle>
          <DialogDescription>
            Added by {source.addedBy} on {source.addedAt}.
          </DialogDescription>
        </DialogHeader>

        <p className="max-h-80 overflow-y-auto text-sm whitespace-pre-wrap">
          {source.body}
        </p>
      </DialogContent>
    </Dialog>
  )
}

function StatusBadge({ source }: { source: Source }) {
  if (source.status === "extracting") {
    return (
      <Badge variant="secondary">
        <Spinner />
        Extracting
      </Badge>
    )
  }

  if (source.status === "failed") {
    return (
      <Badge variant="destructive">
        <FailedIcon />
        Can&apos;t be read
      </Badge>
    )
  }

  return (
    <Badge variant="outline">
      <ReadyIcon className="text-success" />
      Ready
    </Badge>
  )
}
