"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  AddRowIcon,
  BackIcon,
  DeleteRowIcon,
  DownloadIcon,
  FailedIcon,
} from "@/components/mockups/kb-spreadsheets/icons";
import {
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table";
import { SaveBar } from "@/components/shared/save-bar";
import { AppShell } from "@/components/shell/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TOKEN_LIMIT,
  TOKEN_WARNING,
  sheetTokens,
  type Sheet,
  type Source,
} from "@/lib/mockups/kb-spreadsheets-data";
import { KNOWLEDGE_BASE } from "@/lib/mockups/knowledge-base-data";
import { cn } from "@/lib/utils";

interface DraftRow {
  id: string;
  cells: string[];
  original?: string[];
}

function toDraft(sheet: Sheet): DraftRow[] {
  return sheet.rows.map((cells, index) => ({
    id: `row-${String(index)}`,
    cells: [...cells],
    original: cells,
  }));
}

export function SheetEditor({
  source,
  onBack,
  onSave,
}: {
  source: Source & { sheet: Sheet; tokens: number };
  onBack: () => void;
  onSave: (sheet: Sheet, tokens: number) => void;
}) {
  const { sheet } = source;
  const [draft, setDraft] = React.useState(() => toDraft(sheet));
  const [leaving, setLeaving] = React.useState(false);
  const added = React.useRef(0);
  const lastRow = React.useRef<HTMLInputElement>(null);
  const focusNew = React.useRef(false);
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    root.current?.parentElement?.scrollTo(0, 0);
  }, []);

  const widths = sheet.columns.map((_, index) => {
    const longest = Math.max(
      0,
      ...sheet.rows.map((row) => row[index]?.length ?? 0),
    );
    return longest > 24 ? "min-w-72" : longest > 14 ? "min-w-48" : "min-w-32";
  });

  React.useEffect(() => {
    if (!focusNew.current) return;
    focusNew.current = false;
    lastRow.current?.scrollIntoView({ block: "center" });
    lastRow.current?.focus();
  }, [draft.length]);

  const changes = countChanges(draft, sheet.rows.length);
  const current: Sheet = {
    columns: sheet.columns,
    rows: draft.map((row) => row.cells),
  };
  const tokens = Math.max(
    0,
    source.tokens + sheetTokens(current) - sheetTokens(sheet),
  );
  const over = tokens > TOKEN_LIMIT;
  const near = !over && tokens >= TOKEN_WARNING;

  function edit(rowId: string, column: number, value: string) {
    setDraft((rows) =>
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              cells: row.cells.map((cell, i) => (i === column ? value : cell)),
            }
          : row,
      ),
    );
  }

  function addRow() {
    added.current += 1;
    setDraft((rows) => [
      ...rows,
      {
        id: `new-${String(added.current)}`,
        cells: sheet.columns.map(() => ""),
      },
    ]);
    focusNew.current = true;
  }

  function removeRow(rowId: string) {
    setDraft((rows) => rows.filter((row) => row.id !== rowId));
  }

  function discard() {
    const before = draft;
    setDraft(toDraft(sheet));
    toast("Changes discarded", {
      action: { label: "Undo", onClick: () => setDraft(before) },
    });
  }

  function save() {
    if (over) {
      toast.error("Not saved", {
        description: `The file is over the ${TOKEN_LIMIT.toLocaleString("en-US")}-token limit. Remove some rows first.`,
      });
      return;
    }
    onSave(current, tokens);
    setDraft(toDraft(current));
    toast(`${source.name} saved`);
  }

  function back() {
    if (changes > 0) setLeaving(true);
    else onBack();
  }

  return (
    <AppShell
      active="Knowledge Bases"
      breadcrumb={["Knowledge Bases", KNOWLEDGE_BASE.name, source.name]}
    >
      <div ref={root} className="flex min-h-full flex-col gap-6 p-3 lg:p-4">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <Button
              aria-label={`Back to ${KNOWLEDGE_BASE.name}`}
              size="icon-sm"
              variant="ghost"
              onClick={back}
            >
              <BackIcon className="rtl:rotate-180" />
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold" dir="auto">
                {source.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {draft.length} rows · {sheet.columns.length} columns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <TokenReading tokens={tokens} over={over} near={near} />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={addRow}>
                <AddRowIcon />
                Add row
              </Button>
              <Button variant="outline" aria-label={`Download ${source.name}`}>
                <DownloadIcon />
                Download
              </Button>
            </div>
          </div>
        </header>

        {over ? (
          <Alert variant="destructive">
            <FailedIcon />
            <AlertTitle>Over the token limit</AlertTitle>
            <AlertDescription>
              Remove rows or shorten cells to save. A file can be up to{" "}
              {TOKEN_LIMIT.toLocaleString("en-US")} tokens.
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="[--card-spacing:0px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <DataTableHeaderRow>
                  <DataTableHead className="w-12 text-end">#</DataTableHead>
                  {sheet.columns.map((column) => (
                    <DataTableHead key={column} className="ps-4.5">
                      {column}
                    </DataTableHead>
                  ))}
                  <TableHead className="w-12" />
                </DataTableHeaderRow>
              </TableHeader>

              <TableBody>
                {draft.map((row, rowIndex) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-end text-muted-foreground tabular-nums">
                      {rowIndex + 1}
                    </TableCell>
                    {row.cells.map((cell, column) => {
                      const changed =
                        !row.original || cell !== row.original[column];
                      return (
                        <TableCell
                          key={sheet.columns[column]}
                          className={cn(changed && "bg-primary-tint")}
                        >
                          <Input
                            ref={
                              rowIndex === draft.length - 1 && column === 0
                                ? lastRow
                                : undefined
                            }
                            aria-label={`${sheet.columns[column]}, row ${String(rowIndex + 1)}`}
                            className={cn(
                              widths[column],
                              "border-transparent bg-transparent hover:border-input",
                            )}
                            dir="auto"
                            value={cell}
                            onChange={(event) =>
                              edit(row.id, column, event.target.value)
                            }
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Button
                        aria-label={`Delete row ${String(rowIndex + 1)}`}
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => removeRow(row.id)}
                      >
                        <DeleteRowIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <SaveBar changes={changes} onDiscard={discard} onSave={save} />
      </div>

      <AlertDialog open={leaving} onOpenChange={setLeaving}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              {changes === 1 ? "1 change" : `${String(changes)} changes`} to{" "}
              <span dir="auto">{source.name}</span> will be lost. The saved file
              stays as it was.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onBack}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function countChanges(draft: DraftRow[], originalRows: number): number {
  const kept = draft.filter((row) => row.original);
  const edited = kept.reduce(
    (sum, row) =>
      sum + row.cells.filter((cell, i) => cell !== row.original?.[i]).length,
    0,
  );
  const added = draft.length - kept.length;
  const removed = originalRows - kept.length;
  return edited + added + removed;
}

function TokenReading({
  tokens,
  over,
  near,
}: {
  tokens: number;
  over: boolean;
  near: boolean;
}) {
  return (
    <div className="flex w-44 flex-col gap-1.5">
      <span
        className={cn(
          "text-xs tabular-nums",
          over
            ? "text-destructive"
            : near
              ? "text-warning"
              : "text-muted-foreground",
        )}
      >
        {tokens.toLocaleString("en-US")} of{" "}
        {TOKEN_LIMIT.toLocaleString("en-US")} tokens
      </span>
      <Progress
        aria-label="Token budget used"
        value={Math.min(100, (tokens / TOKEN_LIMIT) * 100)}
      />
    </div>
  );
}
