"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  BatchStatusBadge,
  CancelBatchDialog,
  canCancel,
  canToggle,
  count,
} from "@/components/mockups/batch-cancel/batch-parts";
import {
  CancelBatchIcon,
  ExportIcon,
  NewBatchIcon,
  PauseBatchIcon,
  ResumeBatchIcon,
  RowMenuIcon,
  SettingsIcon,
} from "@/components/mockups/batch-cancel/icons";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cancelBatch,
  settled,
  type Batch,
} from "@/lib/mockups/batch-cancel-data";

const NOW = "Nov 5, 2026, 2:32 PM";

function useToggle(onChange: (next: Batch) => void) {
  return (batch: Batch) => {
    const resuming = batch.status === "paused";
    const next: Batch = { ...batch, status: resuming ? "running" : "paused" };
    onChange(next);
    toast(resuming ? "Batch resumed" : "Batch paused", {
      description: resuming
        ? undefined
        : `Its ${count(batch.queued)} queued calls keep their numbers until you resume or cancel.`,
      action: { label: "Undo", onClick: () => onChange(batch) },
    });
  };
}

function cancelledToast(batch: Batch) {
  toast("Batch cancelled", {
    description:
      batch.inProgress > 0
        ? `${count(batch.queued)} queued calls were cancelled. ${count(batch.inProgress)} in progress will finish.`
        : `${count(batch.queued)} queued calls were cancelled.`,
  });
}

export function BatchPage({
  batch,
  canWrite,
  onChange,
}: {
  batch: Batch;
  canWrite: boolean;
  onChange: (next: Batch) => void;
}) {
  const [confirming, setConfirming] = React.useState(false);
  const toggle = useToggle(onChange);
  const isCancelled = batch.status === "cancelled";
  const progress = Math.round((settled(batch) / batch.totalCalls) * 100);

  return (
    <main className="mx-auto flex w-full max-w-350 flex-col gap-6 p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold" dir="auto">
            {batch.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <BatchStatusBadge status={batch.status} />
            {isCancelled && batch.cancelledBy ? (
              <span>
                Cancelled by {batch.cancelledBy} · {batch.cancelledAt}
              </span>
            ) : (
              <span>Created {batch.createdAt}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canWrite && canCancel(batch) ? (
            <Button
              className="text-destructive"
              onClick={() => setConfirming(true)}
              size="sm"
              variant="ghost"
            >
              <CancelBatchIcon />
              Cancel batch
            </Button>
          ) : null}
          <Button size="sm" variant="outline">
            <ExportIcon />
            Export
          </Button>
          {isCancelled ? null : (
            <Button size="sm" variant="outline">
              <SettingsIcon />
              Settings
            </Button>
          )}
          {canWrite && canToggle(batch) ? (
            <Button onClick={() => toggle(batch)} size="sm" variant="outline">
              {batch.status === "paused" ? (
                <ResumeBatchIcon />
              ) : (
                <PauseBatchIcon />
              )}
              {batch.status === "paused" ? "Resume batch" : "Pause batch"}
            </Button>
          ) : null}
          {isCancelled && canWrite ? (
            <Button size="sm">
              <NewBatchIcon />
              New batch
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Batch size" value={count(batch.totalCalls)} />
        <Kpi
          label="Pickup rate"
          value={
            batch.pickupRate === null ? "—" : `${batch.pickupRate.toFixed(1)}%`
          }
        />
        <Kpi
          label="Success rate"
          value={
            batch.successRate === null
              ? "—"
              : `${batch.successRate.toFixed(1)}%`
          }
        />
      </div>

      {isCancelled ? (
        <dl className="flex flex-wrap gap-x-8 gap-y-3">
          <Count label="Completed" value={batch.completed} />
          <Count label="Failed" value={batch.failed} />
          <Count label="Cancelled" value={batch.cancelled} />
          {batch.inProgress > 0 ? (
            <Count label="Still in progress" value={batch.inProgress} />
          ) : null}
        </dl>
      ) : (
        <div className="flex items-center gap-3">
          <Progress
            aria-label="Batch completion"
            className="flex-1"
            value={progress}
          />
          <span className="text-sm text-muted-foreground tabular-nums">
            {progress}% ({count(settled(batch))}/{count(batch.totalCalls)})
          </span>
        </div>
      )}

      <CancelBatchDialog
        batch={batch}
        onCancelled={() => {
          setConfirming(false);
          cancelledToast(batch);
          onChange(cancelBatch(batch, NOW));
        }}
        onOpenChange={setConfirming}
        open={confirming}
      />
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
      </CardContent>
    </Card>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{count(value)}</dd>
    </div>
  );
}

export function BatchList({
  batches,
  canWrite,
  onChange,
}: {
  batches: readonly Batch[];
  canWrite: boolean;
  onChange: (next: Batch) => void;
}) {
  const [confirming, setConfirming] = React.useState<Batch | null>(null);
  const toggle = useToggle(onChange);

  return (
    <main className="mx-auto flex w-full max-w-350 flex-col gap-6 p-8">
      <PageHeader title="Batch calls" />
      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Name</DataTableHead>
            <DataTableHead>Status</DataTableHead>
            <DataTableHead className="text-end">Total calls</DataTableHead>
            <DataTableHead className="text-end">Pickup rate</DataTableHead>
            <DataTableHead className="text-end">Success rate</DataTableHead>
            <DataTableHead>Created</DataTableHead>
            {canWrite ? (
              <DataTableHead className="w-12">
                <span className="sr-only">Actions</span>
              </DataTableHead>
            ) : null}
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell className="font-medium" dir="auto">
                {batch.name}
              </TableCell>
              <TableCell>
                <BatchStatusBadge status={batch.status} />
              </TableCell>
              <TableCell className="text-end tabular-nums">
                {count(batch.totalCalls)}
              </TableCell>
              <TableCell className="text-end tabular-nums">
                {batch.pickupRate === null
                  ? "—"
                  : `${batch.pickupRate.toFixed(1)}%`}
              </TableCell>
              <TableCell className="text-end tabular-nums">
                {batch.successRate === null
                  ? "—"
                  : `${batch.successRate.toFixed(1)}%`}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {batch.createdAt}
              </TableCell>
              {canWrite ? (
                <TableCell className="text-end">
                  <RowActions
                    batch={batch}
                    onCancel={() => setConfirming(batch)}
                    onToggle={() => toggle(batch)}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      {confirming ? (
        <CancelBatchDialog
          batch={confirming}
          onCancelled={() => {
            cancelledToast(confirming);
            onChange(cancelBatch(confirming, NOW));
            setConfirming(null);
          }}
          onOpenChange={(open) => {
            if (!open) setConfirming(null);
          }}
          open
        />
      ) : null}
    </main>
  );
}

function RowActions({
  batch,
  onCancel,
  onToggle,
}: {
  batch: Batch;
  onCancel: () => void;
  onToggle: () => void;
}) {
  const toggleable = canToggle(batch);
  const cancellable = canCancel(batch);
  if (!toggleable && !cancellable) return null;
  const paused = batch.status === "paused";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Actions for ${batch.name}`}
          size="icon-sm"
          variant="ghost"
        >
          <RowMenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {toggleable ? (
          <DropdownMenuItem onSelect={onToggle}>
            {paused ? <ResumeBatchIcon /> : <PauseBatchIcon />}
            {paused ? "Resume batch" : "Pause batch"}
          </DropdownMenuItem>
        ) : null}
        {toggleable && cancellable ? <DropdownMenuSeparator /> : null}
        {cancellable ? (
          <DropdownMenuItem onSelect={onCancel} variant="destructive">
            <CancelBatchIcon />
            Cancel batch
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
