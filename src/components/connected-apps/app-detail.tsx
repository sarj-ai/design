"use client"

import * as React from "react"

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
  liveTokens,
  TOKEN_CAP,
  type ConnectedApp,
  type Token,
} from "@/lib/connected-apps-data"
import { CreateTokenDialog } from "@/components/connected-apps/create-token-dialog"
import { TokenTable } from "@/components/connected-apps/token-table"
import {
  AccessTokenIcon,
  BackToIntegrationsIcon,
  ConnectedAppIcon,
  CreateTokenIcon,
} from "@/components/connected-apps/icons"

/**
 * One connected app and the tokens it authenticates with.
 *
 * The count line sits above the table rather than beside the button because it
 * is the thing that turns the disabled button from a dead end into an
 * instruction — and it counts tokens that still hold a slot, so revoking one
 * visibly buys the reader their next create.
 */
export function AppDetail({
  app,
  onBack,
  onCreated,
  onRevoke,
  tokens,
}: {
  app: ConnectedApp
  onBack: () => void
  onCreated: (token: Token) => void
  onRevoke: (token: Token) => void
  tokens: Token[]
}) {
  const [createOpen, setCreateOpen] = React.useState(false)

  const rows = tokens
    .filter((token) => token.appId === app.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const holding = liveTokens(tokens, app.id).length
  const atCap = holding >= TOKEN_CAP

  return (
    <div className="flex flex-col gap-6">
      <Button
        className="-ms-2.5 self-start"
        onClick={onBack}
        size="sm"
        variant="ghost"
      >
        <BackToIntegrationsIcon className="rtl:rotate-180" />
        Integrations
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-4">
        {/* A 32px square against exactly two lines is the centred case. */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-tint p-2 text-primary-tint-foreground">
            <ConnectedAppIcon />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold" dir="auto">
              {app.name}
            </h1>
            <p className="text-sm text-muted-foreground" dir="auto">
              {app.description}
            </p>
          </div>
        </div>

        <Button disabled={atCap} onClick={() => setCreateOpen(true)}>
          <CreateTokenIcon />
          New access token
        </Button>
      </header>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader className="max-w-sm">
            <EmptyMedia variant="icon">
              <AccessTokenIcon />
            </EmptyMedia>
            <EmptyTitle>No access tokens yet</EmptyTitle>
            <EmptyDescription>
              This app cannot call Sarj until it has one. The token&apos;s
              secret is shown once, when you create it.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setCreateOpen(true)}>
              <CreateTokenIcon />
              New access token
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground tabular-nums">
            {atCap
              ? `You are using all ${TOKEN_CAP} available access tokens. Revoke one to create another.`
              : `You are currently using ${holding} out of ${TOKEN_CAP} available access tokens.`}
          </p>

          <Card className="[--card-spacing:0px]">
            <div className="overflow-x-auto">
              <TokenTable onRevoke={onRevoke} tokens={rows} />
            </div>
          </Card>
        </div>
      )}

      <CreateTokenDialog
        app={app}
        onCreated={onCreated}
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
    </div>
  )
}
