"use client";

import * as React from "react";

import {
  CancelledStatusIcon,
  DoneStatusIcon,
  PausedStatusIcon,
  QueuedStatusIcon,
  RunningStatusIcon,
} from "@/components/mockups/batch-cancel/icons";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  settled,
  type Batch,
  type BatchStatus,
} from "@/lib/mockups/batch-cancel-data";

const CHIPS: Record<
  BatchStatus,
  { label: string; tone: string; Icon: React.ComponentType }
> = {
  done: {
    label: "Done",
    tone: "bg-success-tint text-success-tint-foreground",
    Icon: DoneStatusIcon,
  },
  running: {
    label: "Running",
    tone: "bg-warning-tint text-warning-tint-foreground",
    Icon: RunningStatusIcon,
  },
  queued: {
    label: "Queued",
    tone: "bg-primary-tint text-primary-tint-foreground",
    Icon: QueuedStatusIcon,
  },
  paused: {
    label: "Paused",
    tone: "bg-muted text-muted-foreground",
    Icon: PausedStatusIcon,
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-muted text-muted-foreground",
    Icon: CancelledStatusIcon,
  },
};

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const { label, tone, Icon } = CHIPS[status];
  return (
    <Badge className={tone} variant="secondary">
      <Icon />
      {label}
    </Badge>
  );
}

export function canCancel(batch: Batch): boolean {
  return batch.status !== "cancelled" && batch.queued > 0;
}

export function canToggle(batch: Batch): boolean {
  return (
    batch.status === "running" ||
    batch.status === "queued" ||
    batch.status === "paused"
  );
}

export const count = (value: number) => value.toLocaleString("en-US");

export function CancelBatchDialog({
  batch,
  onCancelled,
  onOpenChange,
  open,
}: {
  batch: Batch;
  onCancelled: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [pending, setPending] = React.useState(false);
  const finished = settled(batch);

  return (
    <AlertDialog
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Cancel <span dir="auto">{batch.name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {count(batch.queued)} queued{" "}
            {batch.queued === 1 ? "call is" : "calls are"} cancelled and their
            numbers freed for a new batch.{" "}
            {finished + batch.inProgress > 0 ? (
              <>
                {count(finished)} finished
                {batch.inProgress > 0
                  ? ` and ${count(batch.inProgress)} in progress`
                  : ""}{" "}
                aren&apos;t affected.{" "}
              </>
            ) : null}
            You can&apos;t resume it afterwards. To stop for now, pause instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep batch</AlertDialogCancel>
          <Button
            disabled={pending}
            onClick={() => {
              setPending(true);
              window.setTimeout(() => {
                setPending(false);
                onCancelled();
              }, 900);
            }}
            variant="destructive"
          >
            {pending ? <Spinner /> : null}
            {pending
              ? "Cancelling"
              : `Cancel ${count(batch.queued)} ${batch.queued === 1 ? "call" : "calls"}`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
