"use client"

import * as React from "react"

import { DashboardPage } from "@/components/mockups/dashboard/dashboard-page"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/**
 * PROD-600 — the dashboard brought in line with the design system, in the
 * product chrome. The period buttons switch the data the way the page does;
 * the reviewer switch up top empties the window, so the zero and -100% case
 * the ticket asks for can be checked on every period.
 */
export default function DashboardRoute() {
  const [data, setData] = React.useState<"calls" | "none">("calls")

  return (
    <MockupShell
      actions={
        <ToggleGroup
          onValueChange={(next) => {
            if (next) setData(next as "calls" | "none")
          }}
          size="sm"
          type="single"
          value={data}
          variant="outline"
        >
          <ToggleGroupItem value="calls">Calls</ToggleGroupItem>
          <ToggleGroupItem value="none">No calls</ToggleGroupItem>
        </ToggleGroup>
      }
      title="Dashboard in line with the design system"
    >
      <AppShell active="Dashboard">
        <div className="flex flex-1 flex-col p-3 lg:p-4">
          <DashboardPage noCalls={data === "none"} />
        </div>
      </AppShell>
    </MockupShell>
  )
}
