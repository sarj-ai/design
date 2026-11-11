"use client";

import * as React from "react";
import { toast } from "sonner";

import { JsonView } from "@/components/design-system/json-view-preview";
import {
  ResendIcon,
  ShowPayloadIcon,
} from "@/components/mockups/webhook-reruns/icons";
import {
  DeliveryBadge,
  ResendDialog,
} from "@/components/mockups/webhook-reruns/resend-dialog";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SAMPLE_PAYLOAD,
  scenarioLabel,
  STAFF_NAME,
  withinRebuild,
  type Attempt,
  type Payload,
  type SingleCall,
} from "@/lib/mockups/webhook-reruns-data";

const PAYLOAD_LABEL: Record<Payload, string> = {
  stored: "Stored",
  rebuilt: "Rebuilt",
};

function formatTime(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
}

export function CallWebhook({ call }: { call: SingleCall }) {
  const [attempts, setAttempts] = React.useState(call.attempts);
  const [open, setOpen] = React.useState(false);
  const [payloadOpen, setPayloadOpen] = React.useState(false);

  const latest = attempts.at(0);
  const sending = latest?.pending === true;
  const eligible: Record<Payload, number> = {
    stored: delivered(latest) ? 0 : 1,
    rebuilt: withinRebuild(call.endedAt) ? 1 : 0,
  };
  const canResend = eligible.stored + eligible.rebuilt > 0;

  const resend = (payload: Payload) => {
    setOpen(false);
    const id = `resend-${String(attempts.length)}`;
    setAttempts((current) => [
      {
        id,
        at: new Date(),
        trigger: `Resent by ${STAFF_NAME}`,
        payload,
        code: null,
        pending: true,
      },
      ...current,
    ]);
    window.setTimeout(() => {
      setAttempts((current) =>
        current.map((attempt) =>
          attempt.id === id
            ? { ...attempt, code: 200, pending: false }
            : attempt,
        ),
      );
      toast.success("Webhook delivered · 200");
    }, 1600);
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="truncate font-mono text-2xl font-semibold">{call.id}</h1>
        <p className="text-sm text-muted-foreground">
          {scenarioLabel(call.scenario)} · ended {formatTime(call.endedAt)} UTC
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Webhook</CardTitle>
          <CardDescription className="truncate font-mono" dir="ltr">
            {call.url}
          </CardDescription>
          {canResend ? (
            <CardAction>
              <Button
                disabled={sending}
                onClick={() => setOpen(true)}
                size="sm"
                variant="outline"
              >
                <ResendIcon />
                Resend webhook
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DataTable>
            <TableHeader>
              <DataTableHeaderRow>
                <DataTableHead>Sent</DataTableHead>
                <DataTableHead>Trigger</DataTableHead>
                <DataTableHead>Payload</DataTableHead>
                <DataTableHead className="text-end">Response</DataTableHead>
              </DataTableHeaderRow>
            </TableHeader>
            <TableBody>
              {attempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatTime(attempt.at)}
                  </TableCell>
                  <TableCell>{attempt.trigger}</TableCell>
                  <TableCell>{PAYLOAD_LABEL[attempt.payload]}</TableCell>
                  <TableCell className="text-end">
                    <DeliveryBadge
                      code={attempt.code}
                      pending={attempt.pending}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>

          <Collapsible onOpenChange={setPayloadOpen} open={payloadOpen}>
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="ghost">
                Last payload
                <ShowPayloadIcon
                  className={
                    payloadOpen
                      ? "rotate-180 transition-transform duration-150 ease-out-cubic motion-reduce:transition-none"
                      : "transition-transform duration-150 ease-out-cubic motion-reduce:transition-none"
                  }
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <JsonView value={{ ...SAMPLE_PAYLOAD, "call_id": call.id }} />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <ResendDialog
        eligible={eligible}
        onOpenChange={setOpen}
        onResend={resend}
        open={open}
        showCounts={false}
        title="Resend this call's webhook?"
      />
    </main>
  );
}

function delivered(attempt: Attempt | undefined) {
  return (
    attempt?.code !== null &&
    attempt?.code !== undefined &&
    attempt.code >= 200 &&
    attempt.code < 300
  );
}
