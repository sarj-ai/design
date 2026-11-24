"use client";

import * as React from "react";
import { toast } from "sonner";

import { useRecordKeys } from "@/components/design-system/surface-demos";
import {
  TopicCallsChart,
  topicColour,
} from "@/components/mockups/topic-trends/charts";
import {
  CloseIcon,
  NextTopicIcon,
  PreviousTopicIcon,
} from "@/components/mockups/topic-trends/icons";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table";
import { ListFooter } from "@/components/shared/list-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TOPICS,
  formatDate,
  formatPercent,
  type Call,
  type TopicStats,
} from "@/lib/mockups/topic-trends-data";

export type Opened =
  | { kind: "topic"; id: string; list: "unresolved" | "all" }
  | { kind: "unresolved" };

export function TopicDrawer({
  onOpenChange,
  onOpen,
  opened,
  order,
  periodLabel,
  topics,
  unresolved,
  unit,
}: {
  onOpenChange: (open: boolean) => void;
  onOpen: (next: Opened) => void;
  opened: Opened | null;
  order: string[];
  periodLabel: string;
  topics: TopicStats[];
  unresolved: Call[];
  unit: "day" | "week";
}) {
  const index =
    opened?.kind === "topic"
      ? topics.findIndex((entry) => entry.topic.id === opened.id)
      : -1;
  const entry = index >= 0 ? topics[index] : null;

  const step = (by: number) => {
    if (opened?.kind !== "topic") return;
    const next = topics.at(
      Math.min(topics.length - 1, Math.max(0, index + by)),
    );
    if (next) onOpen({ ...opened, id: next.topic.id });
  };
  useRecordKeys(opened?.kind === "topic", step);

  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={!!opened}>
      <DrawerContent className="sm:max-w-5xl!">
        {opened?.kind === "unresolved" ? (
          <>
            <Header
              description={`Every topic, ${periodLabel.toLowerCase()}, newest first`}
              title="Unresolved calls"
            />
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
              <CallsTable calls={unresolved} showTopic />
            </div>
          </>
        ) : entry && opened?.kind === "topic" ? (
          <>
            <Header
              description={entry.topic.definition}
              nav={
                <>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {index + 1} of {topics.length}
                  </span>
                  <ButtonGroup>
                    <Button
                      aria-label="Previous topic"
                      disabled={index === 0}
                      onClick={() => step(-1)}
                      size="icon-sm"
                      variant="outline"
                    >
                      <PreviousTopicIcon />
                    </Button>
                    <Button
                      aria-label="Next topic"
                      disabled={index === topics.length - 1}
                      onClick={() => step(1)}
                      size="icon-sm"
                      variant="outline"
                    >
                      <NextTopicIcon />
                    </Button>
                  </ButtonGroup>
                </>
              }
              title={
                <>
                  {entry.topic.name}
                  <span
                    className="text-sm font-normal text-muted-foreground"
                    dir="rtl"
                  >
                    {entry.topic.arabic}
                  </span>
                </>
              }
            />
            <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-6">
              <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <Stat label="Calls" value={String(entry.calls.length)} />
                <Stat label="Share" value={formatPercent(entry.share)} />
                <Stat
                  label="Not resolved"
                  value={formatPercent(entry.unresolvedRate)}
                />
                <Stat
                  label="Frustrated"
                  value={formatPercent(entry.frustratedRate)}
                />
              </dl>

              <TopicCallsChart
                colour={topicColour(entry.topic.id, order)}
                entry={entry}
                unit={unit}
              />

              <div className="flex flex-col gap-4">
                <Tabs
                  onValueChange={(next) =>
                    onOpen({
                      ...opened,
                      list: next === "all" ? "all" : "unresolved",
                    })
                  }
                  value={opened.list}
                >
                  <TabsList>
                    <TabsTrigger value="unresolved">
                      Not resolved
                      <span className="text-muted-foreground tabular-nums">
                        {entry.unresolved.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      All calls
                      <span className="text-muted-foreground tabular-nums">
                        {entry.calls.length}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <CallsTable
                  calls={
                    opened.list === "unresolved"
                      ? entry.unresolved
                      : entry.calls
                  }
                  key={`${entry.topic.id}-${opened.list}`}
                />
              </div>
            </div>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function Header({
  description,
  nav,
  title,
}: {
  description: string;
  nav?: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
      <div className="flex flex-col gap-0.5">
        <DrawerTitle className="flex flex-wrap items-baseline gap-x-2">
          {title}
        </DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {nav}
        <DrawerClose asChild>
          <Button aria-label="Close" size="icon-sm" variant="ghost">
            <CloseIcon />
          </Button>
        </DrawerClose>
      </div>
    </DrawerHeader>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

const PAGE_SIZE = 10;

function CallsTable({
  calls,
  showTopic = false,
}: {
  calls: Call[];
  showTopic?: boolean;
}) {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(PAGE_SIZE);
  const from = page * size;
  const rows = calls.slice(from, from + size);

  if (!calls.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No unresolved calls in this topic for this period.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <DataTable className="table-fixed">
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead className="w-32">Date</DataTableHead>
            <DataTableHead>What the caller wanted</DataTableHead>
            {showTopic ? (
              <DataTableHead className="w-48">Topic</DataTableHead>
            ) : null}
            <DataTableHead className="w-52">Outcome</DataTableHead>
            <DataTableHead>Why it wasn&apos;t resolved</DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {rows.map((call) => (
            <TableRow
              className="cursor-pointer"
              key={call.id}
              onClick={() =>
                toast(`Opens call ${call.id.slice(0, 8)} on its call page`)
              }
            >
              <TableCell className="text-muted-foreground tabular-nums">
                {formatDate(call.at, true)}
              </TableCell>
              <TableCell className="truncate" dir="auto">
                {call.purpose}
              </TableCell>
              {showTopic ? (
                <TableCell className="truncate text-muted-foreground">
                  {TOPICS.find((topic) => topic.id === call.topic)?.name}
                </TableCell>
              ) : null}
              <TableCell>
                <span className="flex items-center gap-1">
                  {call.resolved ? (
                    <Badge className="bg-success-tint text-success-tint-foreground">
                      Resolved
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive-tint text-destructive-tint-foreground">
                      Not resolved
                    </Badge>
                  )}
                  {call.frustrated ? (
                    <Badge className="bg-warning-tint text-warning-tint-foreground">
                      Frustrated
                    </Badge>
                  ) : null}
                </span>
              </TableCell>
              <TableCell className="truncate text-muted-foreground">
                {call.reason ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
      <ListFooter
        atEnd={from + size >= calls.length}
        atStart={page === 0}
        from={from + 1}
        noun="calls"
        onFirst={() => setPage(0)}
        onNext={() => setPage((current) => current + 1)}
        onPageSizeChange={(next) => {
          setSize(next);
          setPage(0);
        }}
        onPrevious={() => setPage((current) => current - 1)}
        pageSize={size}
        shown={rows.length}
        total={calls.length}
      />
    </div>
  );
}
