"use client"

import * as React from "react"

import { DataTableHead, DataTableHeaderRow } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  daysUntil,
  formatDate,
  liveTokens,
  NEAR_EXPIRY_DAYS,
  tokenStatus,
  type ConnectedApp,
  type Token,
} from "@/lib/connected-apps-data"
import { CreateAppDialog } from "@/components/connected-apps/create-app-dialog"
import {
  ConnectedAppIcon,
  CreateAppIcon,
} from "@/components/connected-apps/icons"

/**
 * The organization's own integrations.
 *
 * No row menu: there is no app-level action here. Deleting a connected app is
 * a cascade over live credentials, which is a flow of its own and not one this
 * ticket asks for.
 */
export function AppsOverview({
  apps,
  onCreate,
  onOpen,
  tokens,
}: {
  apps: ConnectedApp[]
  onCreate: (app: ConnectedApp) => void
  onOpen: (appId: string) => void
  tokens: Token[]
}) {
  const [createOpen, setCreateOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold">Connected apps</h1>
          <p className="text-sm text-muted-foreground">
            Your own systems that call Sarj, and the access tokens each one
            authenticates with.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <CreateAppIcon />
          New connected app
        </Button>
      </header>

      {apps.length === 0 ? (
        <Empty>
          <EmptyHeader className="max-w-sm">
            <EmptyMedia variant="icon">
              <ConnectedAppIcon />
            </EmptyMedia>
            <EmptyTitle>No connected apps yet</EmptyTitle>
            <EmptyDescription>
              A connected app is one of your own systems that calls Sarj — it
              holds the access tokens that system authenticates with.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setCreateOpen(true)}>
              <CreateAppIcon />
              New connected app
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Card className="[--card-spacing:0px]">
          <div className="overflow-x-auto">
            <Table className="[&_tbody_tr:last-child]:border-0 [&_td]:px-4 [&_th]:px-4">
              <TableHeader>
                <DataTableHeaderRow>
                  <DataTableHead>App</DataTableHead>
                  <DataTableHead>Access tokens</DataTableHead>
                  <DataTableHead>Created</DataTableHead>
                  <DataTableHead>Created by</DataTableHead>
                </DataTableHeaderRow>
              </TableHeader>

              <TableBody>
                {apps.map((app) => (
                  <AppRow
                    app={app}
                    key={app.id}
                    onOpen={onOpen}
                    tokens={tokens}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <CreateAppDialog
        onCreate={onCreate}
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
    </div>
  )
}

function AppRow({
  app,
  onOpen,
  tokens,
}: {
  app: ConnectedApp
  onOpen: (appId: string) => void
  tokens: Token[]
}) {
  const live = liveTokens(tokens, app.id)
  const active = live.filter((token) => tokenStatus(token) === "active")

  /* Expiry is the one thing worth surfacing a level up: it is the reason a
     reader opens an app they were not already thinking about. */
  const expiring = active.filter(
    (token) =>
      token.expiresAt !== null &&
      daysUntil(token.expiresAt) <= NEAR_EXPIRY_DAYS,
  ).length

  /* Spelled out because the ceiling counts both: an app showing "4 active"
     that will not let you create a fifth token reads as a bug unless the
     expired one is on the line too. */
  const expired = live.length - active.length

  return (
    /* The whole row opens the app. It already lights up on hover, and a row
       that looks clickable and is not is the fastest way to make a mockup feel
       broken. The name stays a real link so there is still something to tab
       to — clicking it just opens the same app twice, which is nothing. */
    <TableRow
      className="cursor-pointer transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none"
      onClick={() => onOpen(app.id)}
    >
      <TableCell>
        <div className="flex flex-col gap-0.5">
          {/* Negative margin cancels the Button's own inline padding so the
              name starts on the column's edge like every other cell.

              `text-foreground` because the whole row opens the app: link
              colour on the name alone would point at the one part of the row
              that is no more clickable than the rest of it. The button stays,
              unstyled as a link, so there is still something to tab to — the
              hover underline is what marks it. */}
          <Button
            className="-ms-2.5 h-auto w-fit justify-start text-foreground"
            onClick={() => onOpen(app.id)}
            variant="link"
          >
            <span dir="auto">{app.name}</span>
          </Button>
          <span className="text-xs text-muted-foreground" dir="auto">
            {app.description}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          {active.length === 0 ? (
            <span className="text-muted-foreground">None yet</span>
          ) : (
            <span className="tabular-nums">
              {active.length} active
              {expired > 0 ? `, ${expired} expired` : ""}
            </span>
          )}
          {expiring > 0 ? (
            <Badge
              className="bg-warning-tint text-warning-tint-foreground"
              variant="secondary"
            >
              {expiring} expiring
            </Badge>
          ) : null}
        </div>
      </TableCell>

      <TableCell className="text-muted-foreground">
        {formatDate(app.createdAt)}
      </TableCell>

      <TableCell className="text-muted-foreground" dir="auto">
        {app.createdBy}
      </TableCell>
    </TableRow>
  )
}
