"use client";

import {
  DownloadIcon,
  FailedIcon,
  ReadyIcon,
  RemoveIcon,
} from "@/components/mockups/kb-spreadsheets/icons";
import {
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SOURCE_LABELS,
  TOKEN_LIMIT,
  TOKEN_WARNING,
  formatTokens,
  isFileSource,
  isSpreadsheet,
  type Source,
} from "@/lib/mockups/kb-spreadsheets-data";
import { sourceHref } from "@/lib/mockups/knowledge-base-data";
import { cn } from "@/lib/utils";

export function SourceTable({
  sources,
  onRemove,
  onOpenSheet,
}: {
  sources: Source[];
  onRemove: (id: string) => void;
  onOpenSheet: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <DataTableHeaderRow>
          <DataTableHead>Name</DataTableHead>
          <DataTableHead>Added by</DataTableHead>
          <DataTableHead>Added</DataTableHead>
          <DataTableHead>Status</DataTableHead>
          <TableHead className="w-24" />
        </DataTableHeaderRow>
      </TableHeader>

      <TableBody>
        {sources.map((source) => (
          <TableRow key={source.id}>
            <TableCell>
              <div className="flex min-w-0 flex-col gap-0.5">
                <SourceName source={source} onOpenSheet={onOpenSheet} />
                <SourceDetail source={source} />
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
  );
}

function SourceDetail({ source }: { source: Source }) {
  if (source.problem) {
    return <span className="text-xs text-destructive">{source.problem}</span>;
  }

  if (isSpreadsheet(source.kind) && source.sheet && source.tokens) {
    const near = source.tokens >= TOKEN_WARNING;
    return (
      <span
        className={cn(
          "text-xs",
          near ? "text-warning" : "text-muted-foreground",
        )}
      >
        {SOURCE_LABELS[source.kind]} · {source.sheet.rows.length} rows ·{" "}
        {formatTokens(source.tokens)} of {formatTokens(TOKEN_LIMIT)} tokens
        {near ? ", near the limit" : ""}
      </span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      {source.url ??
        [SOURCE_LABELS[source.kind], source.size]
          .filter((part) => part && part !== "—")
          .join(" · ")}
    </span>
  );
}

function RemoveSource({
  source,
  onRemove,
}: {
  source: Source;
  onRemove: () => void;
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
  );
}

function SourceName({
  source,
  onOpenSheet,
}: {
  source: Source;
  onOpenSheet: (id: string) => void;
}) {
  if (isSpreadsheet(source.kind) && source.status === "ready") {
    return (
      <Button
        className="-ms-2.5 h-auto w-fit justify-start text-foreground"
        onClick={() => onOpenSheet(source.id)}
        variant="link"
      >
        <span dir="auto">{source.name}</span>
      </Button>
    );
  }

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
    );
  }

  if (source.kind === "text") {
    return <TextPreview source={source} />;
  }

  return <span className="font-medium">{source.name}</span>;
}

function TextPreview({ source }: { source: Source }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="-ms-2.5 h-auto w-fit justify-start text-foreground"
          variant="link"
        >
          {source.name}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{source.name}</DialogTitle>
          <DialogDescription>
            Added by {source.addedBy} on {source.addedAt}.
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm whitespace-pre-wrap">{source.body}</p>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ source }: { source: Source }) {
  if (source.status === "extracting") {
    return (
      <Badge variant="secondary">
        <Spinner />
        {isSpreadsheet(source.kind) ? "Reading rows" : "Extracting"}
      </Badge>
    );
  }

  if (source.status === "failed") {
    return (
      <Badge variant="destructive">
        <FailedIcon />
        {isSpreadsheet(source.kind) ? "Not added" : "Can't be read"}
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      <ReadyIcon className="text-success" />
      Ready
    </Badge>
  );
}
