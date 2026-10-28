"use client"

import * as React from "react"
import { toast } from "sonner"

import { LanguageChip } from "@/components/design-system/call-table"
import { ErrorState, useRetry } from "@/components/design-system/error-state"
import { FieldHeader, errorId } from "@/components/design-system/field-header"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import { CallVolumeChart } from "@/components/mockups/dashboard/call-volume-chart"
import { DashboardPage } from "@/components/mockups/dashboard/dashboard-page"
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/shell/app-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import { dashboardData } from "@/lib/mockups/dashboard-data"

/**
 * Errors, at every scope a Sarj screen has, smallest first.
 *
 * The rule the six share: a failure takes the smallest piece of the screen it
 * can, and never more than the piece that broke. A field's error stays on the
 * field. A failed save stays a toast and leaves the form as it was. A section
 * whose request failed keeps its place and its size while everything else on
 * the page renders. A list keeps its header, its search and its columns. A
 * page keeps the sidebar and the top bar, so the reader can leave. Only when
 * the app itself cannot start does the error take the whole window — there is
 * nothing left to keep.
 *
 * Everything above a field uses one block, `ErrorState`: what failed, that
 * trying again is safe, and Try again, which re-runs only what failed.
 */

const SCOPES = [
  { id: "field", label: "Field" },
  { id: "action", label: "Action" },
  { id: "section", label: "Section" },
  { id: "list", label: "List" },
  { id: "page", label: "Page" },
  { id: "app", label: "App" },
]

export function ErrorSystemPreview() {
  const [scope, setScope] = React.useState("section")

  return (
    <SecondaryTabs items={SCOPES} onValueChange={setScope} value={scope}>
      {/* Each tab mounts its own screen, so every one opens failed. */}
      <TabsContent value="field">
        <Frame active="Scenarios">
          <FieldScope />
        </Frame>
      </TabsContent>
      <TabsContent value="action">
        <Frame active="Scenarios">
          <ActionScope />
        </Frame>
      </TabsContent>
      <TabsContent value="section">
        <Frame active="Dashboard">
          <SectionScope />
        </Frame>
      </TabsContent>
      <TabsContent value="list">
        <Frame active="Scenarios">
          <ListScope />
        </Frame>
      </TabsContent>
      <TabsContent value="page">
        <Frame active="Dashboard">
          <PageScope />
        </Frame>
      </TabsContent>
      <TabsContent value="app">
        <AppScope />
      </TabsContent>
    </SecondaryTabs>
  )
}

/** The real app, framed: `translate-x-0` keeps the sidebar inside the demo. */
function Frame({
  active,
  children,
}: {
  active: string
  children: React.ReactNode
}) {
  return (
    <div className="relative flex h-180 translate-x-0 flex-col overflow-hidden rounded-xl border">
      <AppShell active={active} underShell={false}>
        <div className="p-3 lg:p-4">{children}</div>
      </AppShell>
    </div>
  )
}

/* ------------------------------------------------------------------ field */

/** A value the reader typed is wrong: the message sits on the label's line,
 *  so the box does not move. Nothing above the field changes. */
function FieldScope() {
  const [name, setName] = React.useState("")
  const error = name.trim() ? null : "Name the scenario."

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New scenario</CardTitle>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldHeader error={error} htmlFor="scenario-name">
            Name
          </FieldHeader>
          <Input
            aria-describedby={error ? errorId("scenario-name") : undefined}
            aria-invalid={error ? true : undefined}
            id="scenario-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Payment reminder"
            value={name}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

/* ----------------------------------------------------------------- action */

/** A save that did not happen: a toast with Try again, and the form exactly
 *  as the reader left it, so trying again sends the same thing. */
function ActionScope() {
  const attempts = React.useRef(0)
  const [saving, setSaving] = React.useState(false)

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      attempts.current += 1
      if (attempts.current === 1) {
        toast.error("Could not save Payment reminder", {
          description: "Your changes are still here.",
          action: { label: "Try again", onClick: save },
        })
        return
      }
      toast.success("Payment reminder saved")
    }, 700)
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>First message</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          aria-label="First message"
          defaultValue="Hi Noura, this is Sara from Sarj. Is now a good time to talk?"
        />
      </CardContent>
      <CardFooter className="justify-end">
        <Button disabled={saving} onClick={save}>
          Save
        </Button>
      </CardFooter>
    </Card>
  )
}

/* ---------------------------------------------------------------- section */

/** One section's request failed — here the call volume, the ClickHouse case.
 *  The numbers that did load render; the chart's card keeps its title and
 *  its height, and only its body is the error. */
function SectionScope() {
  const chart = useRetry()
  const data = dashboardData("month", { noCalls: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.summary.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle>{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {chart.failed ? (
        <Card>
          <CardHeader>
            <CardTitle>Inbound vs outbound calls</CardTitle>
          </CardHeader>
          <CardContent>
            {/* The chart's own height, so the page does not jump when it
                lands. */}
            <ErrorState
              className="h-72"
              onRetry={chart.retry}
              retrying={chart.retrying}
              title="Could not load call volume"
            />
          </CardContent>
        </Card>
      ) : (
        <CallVolumeChart
          description={data.chartDescription}
          points={data.chart}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------- list */

const COLUMNS = ["Name", "Languages", "Created"]

const PAYMENT_SCENARIOS = [
  { name: "Payment reminder", languages: ["AR", "EN"], created: "12 Oct 2026" },
  { name: "Payment plan follow-up", languages: ["AR"], created: "3 Oct 2026" },
  {
    name: "Late payment — second notice before the account is suspended",
    languages: ["AR", "EN", "UR"],
    created: "28 Sep 2026",
  },
]

/** The rows failed. The header, the search the reader typed and the columns
 *  stay; the error takes the rows' place, and Try again keeps the search. */
function ListScope() {
  const rows = useRetry()

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Scenarios" />
      <Input
        aria-label="Search scenarios"
        className="max-w-sm"
        defaultValue="payment"
      />
      <DataTable>
        <TableBody>
          <DataTableHeaderRow>
            {COLUMNS.map((column) => (
              <DataTableHead key={column}>{column}</DataTableHead>
            ))}
          </DataTableHeaderRow>
          {rows.failed ? (
            <TableRow className="hover:bg-transparent">
              {/* Holding a state, not a row, so it spans the columns. */}
              <TableCell className="h-auto! py-8" colSpan={COLUMNS.length}>
                <ErrorState
                  className="p-0"
                  onRetry={rows.retry}
                  retrying={rows.retrying}
                  title="Could not load scenarios"
                />
              </TableCell>
            </TableRow>
          ) : (
            PAYMENT_SCENARIOS.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="max-w-80 truncate font-medium">
                  {row.name}
                </TableCell>
                <TableCell>
                  <LanguageChip languages={row.languages} />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {row.created}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </DataTable>
    </div>
  )
}

/* ------------------------------------------------------------------- page */

/** Nothing on the page could load. The sidebar and the top bar stay, so the
 *  reader can go anywhere else; the page area names which page broke. */
function PageScope() {
  const page = useRetry()

  if (!page.failed) return <DashboardPage noCalls={false} />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" />
      <div className="rounded-lg border">
        <ErrorState
          onRetry={page.retry}
          retrying={page.retrying}
          title="Could not load the dashboard"
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- app */

/** The shell itself could not start, so there is no sidebar to keep. The one
 *  scope that takes the whole window, and the last resort. */
function AppScope() {
  const app = useRetry()

  if (!app.failed) {
    return (
      <Frame active="Dashboard">
        <DashboardPage noCalls={false} />
      </Frame>
    )
  }

  return (
    <div className="flex h-180 items-center justify-center rounded-xl border">
      <ErrorState
        description="Reloading usually clears it. Nothing was changed."
        onRetry={app.retry}
        retrying={app.retrying}
        title="Could not load Sarj"
      />
    </div>
  )
}
