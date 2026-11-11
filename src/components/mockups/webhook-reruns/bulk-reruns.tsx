"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  NoMatchesIcon,
  OrganizationIcon,
  ResendIcon,
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
import {
  ChoiceFilter,
  DateFilter,
  FilterBar,
  SelectFilter,
  type DateRange,
} from "@/components/shared/filter-bar";
import { ListFooter } from "@/components/shared/list-footer";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CALLS,
  DELIVERIES,
  ORGANIZATIONS,
  RUN_CAP,
  SCENARIOS,
  scenarioLabel,
  TODAY,
  withinRebuild,
  type PastCall,
  type Payload,
} from "@/lib/mockups/webhook-reruns-data";

const DAY = 86_400_000;

type Override = Pick<PastCall, "delivery" | "code" | "attempts">;

function accepts(id: string) {
  return Number.parseInt(id.slice(0, 2), 16) % 25 !== 0;
}

interface Run {
  ids: string[];
  done: number;
  failed: number;
}

export function OrganizationScope() {
  const [organization, setOrganization] = React.useState<string>(
    ORGANIZATIONS[0],
  );
  return (
    <Select onValueChange={setOrganization} value={organization}>
      <SelectTrigger
        aria-label="Admin view"
        className="border-warning/30 bg-warning-tint text-warning-tint-foreground"
        size="sm"
      >
        <OrganizationIcon />
        <span className="font-medium">Admin view:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" position="popper">
        {ORGANIZATIONS.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function formatEnded(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function BulkReruns() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(TODAY.getTime() - 29 * DAY),
    to: TODAY,
  });
  const [scenarios, setScenarios] = React.useState<string[]>([]);
  const [delivery, setDelivery] = React.useState<string | null>("failed");
  const [overrides, setOverrides] = React.useState<Map<string, Override>>(
    () => new Map(),
  );
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [confirming, setConfirming] = React.useState(false);
  const [run, setRun] = React.useState<Run | null>(null);
  const [snapshot, setSnapshot] = React.useState<Set<string> | null>(null);

  const calls = React.useMemo(
    () =>
      CALLS.map((call) => {
        const override = overrides.get(call.id);
        return override ? { ...call, ...override } : call;
      }),
    [overrides],
  );

  const matches = React.useMemo(() => {
    const from = range?.from
      ? new Date(range.from).setUTCHours(0, 0, 0, 0)
      : -Infinity;
    const to = range?.to
      ? new Date(range.to).setUTCHours(23, 59, 59, 999)
      : Infinity;
    if (snapshot) return calls.filter((call) => snapshot.has(call.id));
    return calls.filter(
      (call) =>
        call.endedAt.getTime() >= from &&
        call.endedAt.getTime() <= to &&
        (scenarios.length === 0 || scenarios.includes(call.scenario)) &&
        (delivery === null || call.delivery === delivery),
    );
  }, [calls, range, scenarios, delivery, snapshot]);

  const eligible: Record<Payload, number> = React.useMemo(
    () => ({
      stored: matches.filter((call) => call.delivery === "failed").length,
      rebuilt: matches.filter((call) => withinRebuild(call.endedAt)).length,
    }),
    [matches],
  );

  const overCap = matches.length > RUN_CAP;
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(page, pages - 1);
  const rows = matches.slice(current * pageSize, (current + 1) * pageSize);
  const activeCount =
    (range ? 1 : 0) + (scenarios.length ? 1 : 0) + (delivery ? 1 : 0);

  const filtersChanged = () => {
    setPage(0);
    setSnapshot(null);
  };

  React.useEffect(() => {
    if (!run || run.done >= run.ids.length) return;
    const timer = window.setTimeout(() => {
      const batch = run.ids.slice(run.done, run.done + 6);
      const failed = batch.filter((id) => !accepts(id)).length;
      setOverrides((previous) => {
        const next = new Map(previous);
        for (const id of batch) {
          const base = CALLS.find((call) => call.id === id);
          if (!base) continue;
          const before = next.get(id) ?? base;
          const ok = accepts(id);
          next.set(id, {
            delivery: ok ? "delivered" : "failed",
            code: ok ? 200 : 503,
            attempts: before.attempts + 1,
          });
        }
        return next;
      });
      const done = run.done + batch.length;
      const total = run.failed + failed;
      if (done >= run.ids.length) {
        setRun(null);
        toast.success(
          `${run.ids.length.toLocaleString()} webhooks resent · ${String(total)} failed`,
        );
      } else {
        setRun({ ...run, done, failed: total });
      }
    }, 140);
    return () => window.clearTimeout(timer);
  }, [run]);

  const start = (payload: Payload) => {
    setConfirming(false);
    const ids = matches
      .filter((call) =>
        payload === "stored"
          ? call.delivery === "failed"
          : withinRebuild(call.endedAt),
      )
      .map((call) => call.id);
    setSnapshot(new Set(matches.map((call) => call.id)));
    setRun({ ids, done: 0, failed: 0 });
  };

  const stop = () => {
    if (!run) return;
    toast(
      `Rerun stopped · ${String(run.done)} of ${String(run.ids.length)} sent`,
    );
    setRun(null);
  };

  return (
    <main className="mx-auto flex w-full max-w-350 flex-col gap-6 p-4 sm:p-8">
      <PageHeader title="Webhook reruns" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <FilterBar
          activeCount={activeCount}
          onClearAll={() => {
            setRange(undefined);
            setScenarios([]);
            setDelivery(null);
            filtersChanged();
          }}
        >
          <DateFilter
            field="Ended"
            onChange={(value) => {
              setRange(value);
              filtersChanged();
            }}
            today={TODAY}
            value={range}
          />
          <SelectFilter
            field="Scenario"
            onChange={(value) => {
              setScenarios(value);
              filtersChanged();
            }}
            options={[...SCENARIOS]}
            value={scenarios}
          />
          <ChoiceFilter
            field="Webhook"
            onChange={(value) => {
              setDelivery(value);
              filtersChanged();
            }}
            options={[...DELIVERIES]}
            value={delivery}
          />
        </FilterBar>

        <div className="flex items-center gap-3">
          <span
            className={
              overCap
                ? "text-sm text-destructive tabular-nums"
                : "text-sm text-muted-foreground tabular-nums"
            }
          >
            {overCap
              ? `${matches.length.toLocaleString()} calls · ${String(RUN_CAP)} max per rerun`
              : `${matches.length.toLocaleString()} ${matches.length === 1 ? "call" : "calls"}`}
          </span>
          <Button
            disabled={matches.length === 0 || overCap || run !== null}
            onClick={() => setConfirming(true)}
          >
            <ResendIcon />
            Resend webhooks
          </Button>
        </div>
      </div>

      {run ? (
        <div className="flex flex-col gap-3 rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">
              Resending {run.ids.length.toLocaleString()} webhooks
            </span>
            <Button onClick={stop} size="sm" variant="outline">
              Stop
            </Button>
          </div>
          <Progress value={(run.done / run.ids.length) * 100} />
          <span className="text-xs text-muted-foreground tabular-nums">
            {run.done.toLocaleString()} sent · {run.failed} failed
          </span>
        </div>
      ) : null}

      {matches.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NoMatchesIcon />
            </EmptyMedia>
            <EmptyTitle>No calls match</EmptyTitle>
            <EmptyDescription>
              Change the filters to find calls.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          <DataTable>
            <TableHeader>
              <DataTableHeaderRow>
                <DataTableHead>Call</DataTableHead>
                <DataTableHead>Scenario</DataTableHead>
                <DataTableHead>Ended</DataTableHead>
                <DataTableHead className="text-end">Attempts</DataTableHead>
                <DataTableHead className="text-end">
                  Last response
                </DataTableHead>
              </DataTableHeaderRow>
            </TableHeader>
            <TableBody>
              {rows.map((call) => (
                <TableRow key={call.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {call.id.slice(0, 13)}…
                  </TableCell>
                  <TableCell>{scenarioLabel(call.scenario)}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatEnded(call.endedAt)}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {call.attempts}
                  </TableCell>
                  <TableCell className="text-end">
                    <DeliveryBadge code={call.code} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
          <ListFooter
            atEnd={current >= pages - 1}
            atStart={current === 0}
            from={current * pageSize + 1}
            noun="calls"
            onFirst={() => setPage(0)}
            onNext={() => setPage(current + 1)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
            onPrevious={() => setPage(current - 1)}
            pageSize={pageSize}
            shown={rows.length}
            total={matches.length}
          />
        </div>
      )}

      <ResendDialog
        eligible={eligible}
        onOpenChange={setConfirming}
        onResend={start}
        open={confirming}
        showCounts
        title={`Resend webhooks for ${matches.length.toLocaleString()} calls?`}
      />
    </main>
  );
}
