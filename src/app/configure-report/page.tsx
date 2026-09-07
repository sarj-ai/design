"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { MockupShell } from "@/components/mockup-shell"
import { Button } from "@/components/ui/button"
import { ConfigureReportDialog } from "@/components/configure-report/configure-report-dialog"

/**
 * The Configure Report dialog — PROD-289, rebuilding the design DES-155 got
 * approved.
 *
 * The dialog is the deliverable, so the page behind it is only what opens it:
 * the Reports screen's own generate action, and nothing else drawn in to give
 * it somewhere to sit.
 */
export default function ConfigureReportPage() {
  const [open, setOpen] = React.useState(true)

  return (
    <MockupShell
      eyebrow="Reports"
      title="Configure Report before generating it"
    >
      <AppShell active="Reports">
        <main className="mx-auto flex w-full max-w-350 flex-col gap-6 p-3 lg:p-4">
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl font-semibold">Reports</h1>
              <p className="text-sm text-muted-foreground">
                Export calls with the columns your team works from.
              </p>
            </div>

            <Button onClick={() => setOpen(true)}>Generate Report</Button>
          </header>
        </main>
      </AppShell>

      <ConfigureReportDialog onOpenChange={setOpen} open={open} />
    </MockupShell>
  )
}
