"use client";

import * as React from "react";

import { CallDetail } from "@/components/mockups/call-measurements/call-detail";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEASUREMENT_CASES } from "@/lib/mockups/call-measurements-data";

export default function CallMeasurementsPage() {
  const [caseId, setCaseId] = React.useState(MEASUREMENT_CASES[0].id);
  const entry =
    MEASUREMENT_CASES.find((item) => item.id === caseId) ??
    MEASUREMENT_CASES[0];

  return (
    <MockupShell
      title="Measurements on each call"
      actions={
        <>
          <span className="text-xs text-muted-foreground">Case</span>
          <Select
            onValueChange={(value) => {
              const next = MEASUREMENT_CASES.find((item) => item.id === value);
              if (next) setCaseId(next.id);
            }}
            value={caseId}
          >
            <SelectTrigger aria-label="Call case" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {MEASUREMENT_CASES.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
    >
      <AppShell
        active="Conversations"
        breadcrumb={["Conversations", "Call detail"]}
      >
        <main className="mx-auto flex w-full max-w-3xl flex-col p-3 lg:p-4">
          <CallDetail entry={entry} />
        </main>
      </AppShell>
    </MockupShell>
  );
}
