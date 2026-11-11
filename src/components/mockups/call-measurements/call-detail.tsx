"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MeasurementCase } from "@/lib/mockups/call-measurements-data";

import { CompletedIcon, OutboundIcon } from "./icons";
import { MeasurementsTab } from "./measurements-tab";

const SHIPPED_TABS = [
  "Overview",
  "Transcript",
  "Flags",
  "Details",
  "Model settings",
] as const;

export function CallDetail({ entry }: { entry: MeasurementCase }) {
  const { call } = entry;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-4 border-b pb-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="truncate text-xl font-semibold">{call.scenario}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <OutboundIcon className="size-3.5" />
              {call.phoneNumber}
            </span>
            <span aria-hidden>·</span>
            <span>{call.startedAt}</span>
            <span aria-hidden>·</span>
            <span>{call.duration}</span>
          </div>
        </div>
        <Badge className="bg-success-tint text-success-tint-foreground">
          <CompletedIcon />
          Completed
        </Badge>
      </header>

      <Tabs className="gap-6" defaultValue="measurements">
        <TabsList className="justify-start gap-3" variant="line">
          {SHIPPED_TABS.map((label) => (
            <TabsTrigger disabled key={label} value={label}>
              {label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
        </TabsList>
        <TabsContent value="measurements">
          <MeasurementsTab measurements={entry.measurements} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
