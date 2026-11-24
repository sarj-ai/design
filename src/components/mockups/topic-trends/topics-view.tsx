"use client";

import * as React from "react";

import {
  TopicKey,
  TopicShareChart,
  TopicSparkline,
  topicColour,
} from "@/components/mockups/topic-trends/charts";
import {
  NotEnoughCallsIcon,
  SearchCallsIcon,
} from "@/components/mockups/topic-trends/icons";
import {
  TopicDrawer,
  type Opened,
} from "@/components/mockups/topic-trends/topic-drawer";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table";
import { ChoiceFilter, FilterBar } from "@/components/shared/filter-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FEW_CALLS,
  MIN_CALLS,
  PERIODS,
  SHOWS,
  TOPICS,
  formatPercent,
  topicStats,
  type Period,
  type Show,
} from "@/lib/mockups/topic-trends-data";

export type ScenarioState = "few" | "building" | "live";

const ORDER = TOPICS.map((topic) => topic.id);

export function TopicsView({ state }: { state: ScenarioState }) {
  if (state === "few") {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NotEnoughCallsIcon />
          </EmptyMedia>
          <EmptyTitle>Not enough calls yet</EmptyTitle>
          <EmptyDescription>
            Topics appear once this scenario has {MIN_CALLS} calls with a caller
            purpose.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="w-56 gap-2">
          <Progress
            aria-label={`${String(FEW_CALLS)} of ${String(MIN_CALLS)} calls`}
            value={(FEW_CALLS / MIN_CALLS) * 100}
          />
          <span className="text-sm text-muted-foreground tabular-nums">
            {FEW_CALLS} of {MIN_CALLS} calls
          </span>
        </EmptyContent>
      </Empty>
    );
  }

  if (state === "building") return <Building />;

  return <LiveView />;
}

function Building() {
  return (
    <div className="flex flex-col gap-6">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Building topic trends from past calls. This takes up to a few minutes.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton
            className="h-28 rounded-xl motion-reduce:animate-none"
            key={key}
          />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl motion-reduce:animate-none" />
      <Skeleton className="h-64 rounded-lg motion-reduce:animate-none" />
    </div>
  );
}

function LiveView() {
  const [period, setPeriod] = React.useState<Period | null>("30d");
  const [show, setShow] = React.useState<Show | null>(null);
  const [query, setQuery] = React.useState("");
  const [opened, setOpened] = React.useState<Opened | null>(null);

  const data = topicStats({
    period: period ?? "all",
    show: show ?? "all",
    query,
  });
  const periodLabel =
    PERIODS.find((entry) => entry.value === (period ?? "all"))?.label ?? "";
  const unresolved = data.calls.filter((call) => !call.resolved);
  const biggest = data.topics.at(0);
  const worst = data.topics
    .filter((entry) => entry.calls.length >= 10 && entry.unresolvedRate > 0)
    .toSorted((a, b) => b.unresolvedRate - a.unresolvedRate)
    .at(0);

  const clear = () => {
    setShow(null);
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <InputGroup>
          <InputGroupAddon>
            <SearchCallsIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search calls"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search what callers wanted, why it wasn't resolved, or a call ID"
            value={query}
          />
        </InputGroup>
        <FilterBar
          activeCount={(period ? 1 : 0) + (show ? 1 : 0)}
          onClearAll={() => {
            setPeriod(null);
            setShow(null);
          }}
        >
          <ChoiceFilter
            field="Period"
            onChange={(next) =>
              setPeriod(
                PERIODS.find((entry) => entry.value === next)?.value ?? null,
              )
            }
            options={PERIODS.filter((entry) => entry.value !== "all")}
            value={period}
          />
          <ChoiceFilter
            field="Show"
            onChange={(next) =>
              setShow(
                SHOWS.find((entry) => entry.value === next)?.value ?? null,
              )
            }
            options={SHOWS.filter((entry) => entry.value !== "all")}
            value={show}
          />
        </FilterBar>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Calls analysed"
          value={data.calls.length.toLocaleString("en-US")}
        />
        <Metric
          label="Unresolved calls"
          rate={
            data.calls.length
              ? formatPercent(unresolved.length / data.calls.length)
              : undefined
          }
          onOpen={
            unresolved.length
              ? () => setOpened({ kind: "unresolved" })
              : undefined
          }
          value={unresolved.length.toLocaleString("en-US")}
        />
        <Metric
          label="Biggest topic"
          rate={biggest ? formatPercent(biggest.share) : undefined}
          onOpen={
            biggest
              ? () =>
                  setOpened({
                    kind: "topic",
                    id: biggest.topic.id,
                    list: "all",
                  })
              : undefined
          }
          value={biggest?.topic.name ?? "—"}
        />
        <Metric
          label="Most unresolved topic"
          rate={worst ? formatPercent(worst.unresolvedRate) : undefined}
          onOpen={
            worst
              ? () =>
                  setOpened({
                    kind: "topic",
                    id: worst.topic.id,
                    list: "unresolved",
                  })
              : undefined
          }
          value={worst?.topic.name ?? "—"}
        />
      </dl>

      {data.topics.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Topic share by {data.unit}</CardTitle>
            <CardAction className="text-xs text-muted-foreground">
              Live · each call is added as it ends
            </CardAction>
          </CardHeader>
          <CardContent>
            <TopicShareChart
              order={ORDER}
              topics={data.topics}
              unit={data.unit}
            />
          </CardContent>
        </Card>
      ) : null}

      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Topic</DataTableHead>
            <DataTableHead className="w-40">
              {data.unit === "day" ? "Share by day" : "Share by week"}
            </DataTableHead>
            <DataTableHead className="w-28 text-end">Calls</DataTableHead>
            <DataTableHead className="w-28 text-end">Share</DataTableHead>
            <DataTableHead className="w-36 text-end">
              Not resolved
            </DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {data.topics.length ? (
            data.topics.map((entry) => {
              const colour = topicColour(entry.topic.id, ORDER);
              const openTopic = (list: "unresolved" | "all") =>
                setOpened({ kind: "topic", id: entry.topic.id, list });
              return (
                <TableRow
                  className="cursor-pointer"
                  key={entry.topic.id}
                  onClick={() =>
                    openTopic(entry.unresolved.length ? "unresolved" : "all")
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") openTopic("all");
                  }}
                  tabIndex={0}
                >
                  <TableCell>
                    <span className="flex items-center gap-2 font-medium">
                      <TopicKey colour={colour} />
                      {entry.topic.name}
                    </span>
                  </TableCell>
                  <TableCell className="py-0">
                    <TopicSparkline colour={colour} entry={entry} />
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {entry.calls.length}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {formatPercent(entry.share)}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {entry.unresolved.length ? (
                      <Button
                        className="-me-2"
                        onClick={(event) => {
                          event.stopPropagation();
                          openTopic("unresolved");
                        }}
                        size="xs"
                        variant="link"
                      >
                        {entry.unresolved.length}
                        <span className="text-muted-foreground">
                          {formatPercent(entry.unresolvedRate)}
                        </span>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5}>
                <Empty className="py-10">
                  <EmptyHeader>
                    <EmptyTitle>
                      {query
                        ? `No calls match “${query}”`
                        : "No calls match these filters"}
                    </EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={clear} size="sm" variant="outline">
                      Clear filters
                    </Button>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTable>

      <TopicDrawer
        onOpen={setOpened}
        onOpenChange={(open) => {
          if (!open) setOpened(null);
        }}
        opened={opened}
        order={ORDER}
        periodLabel={periodLabel}
        topics={data.topics}
        unit={data.unit}
        unresolved={unresolved}
      />
    </div>
  );
}

function Metric({
  label,
  onOpen,
  rate,
  value,
}: {
  label: string;
  onOpen?: () => void;
  rate?: string;
  value: string;
}) {
  return (
    <Card
      className={
        onOpen
          ? "cursor-pointer transition-colors duration-150 ease-out-cubic hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          : undefined
      }
      onClick={onOpen}
      onKeyDown={(event) => {
        if (onOpen && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onOpen();
        }
      }}
      role={onOpen ? "button" : undefined}
      size="sm"
      tabIndex={onOpen ? 0 : undefined}
    >
      <CardContent className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="flex items-center gap-2 text-base font-semibold tabular-nums">
          <span className="truncate" title={value}>
            {value}
          </span>
          {rate ? (
            <span className="font-normal text-muted-foreground">{rate}</span>
          ) : null}
        </dd>
      </CardContent>
    </Card>
  );
}
