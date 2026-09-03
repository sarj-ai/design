"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { MockupShell } from "@/components/mockup-shell"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  CONNECTED_APPS,
  NOW,
  TOKENS,
  type ConnectedApp,
  type Token,
} from "@/lib/connected-apps-data"
import { AppDetail } from "@/components/connected-apps/app-detail"
import { AppsOverview } from "@/components/connected-apps/apps-overview"

type Preview = "populated" | "first-run"

/**
 * Custom integrations and their access tokens — DES-146 / DIS-24.
 *
 * Two levels on one route: the organization's connected apps, and the tokens
 * under whichever one is open. The move between them is a real click on a real
 * link, so it is not in the reviewer switcher — and neither are the empty,
 * expiring, expired, revoked and at-the-ceiling states, because all of them are
 * reachable by clicking through the default data. The only state that is not is
 * an organization that has never made an app, since apps cannot be deleted.
 * Hence exactly two switch positions.
 */
export default function ConnectedAppsPage() {
  const [preview, setPreview] = React.useState<Preview>("populated")
  const [openAppId, setOpenAppId] = React.useState<string | null>(null)
  const [apps, setApps] = React.useState<ConnectedApp[]>(CONNECTED_APPS)
  const [tokens, setTokens] = React.useState<Token[]>(TOKENS)

  const openApp = apps.find((app) => app.id === openAppId) ?? null

  function switchPreview(next: Preview) {
    setPreview(next)
    setOpenAppId(null)
    setApps(next === "populated" ? CONNECTED_APPS : [])
    setTokens(next === "populated" ? TOKENS : [])
  }

  /* Creating an app opens it, which lands the reader on its empty token list —
     the next thing they have to do rather than a list they have to re-find. */
  function createApp(app: ConnectedApp) {
    setApps((previous) => [...previous, app])
    setOpenAppId(app.id)
  }

  function revoke(token: Token) {
    setTokens((previous) =>
      previous.map((entry) =>
        entry.id === token.id ? { ...entry, revokedAt: NOW } : entry,
      ),
    )
  }

  return (
    <MockupShell
      actions={
        <>
          <span className="text-xs text-muted-foreground">Preview</span>
          <ToggleGroup
            onValueChange={(value) => {
              if (value) switchPreview(value as Preview)
            }}
            size="sm"
            type="single"
            value={preview}
            variant="outline"
          >
            <ToggleGroupItem value="populated">Populated</ToggleGroupItem>
            <ToggleGroupItem value="first-run">First run</ToggleGroupItem>
          </ToggleGroup>
        </>
      }
      eyebrow="Integrations"
      title="Design custom integrations access token management flows"
    >
      <AppShell
        active="Integrations"
        breadcrumb={openApp ? openApp.name : "Integrations"}
        onNavigate={(title) => {
          /* The sidebar's own Integrations item is the second way out of the
             drill-in, so the nav reads as wired rather than decorative. */
          if (title === "Integrations") setOpenAppId(null)
        }}
      >
        <div className="flex flex-1 flex-col p-3 lg:p-4">
          {openApp ? (
            <AppDetail
              app={openApp}
              onBack={() => setOpenAppId(null)}
              onCreated={(token) =>
                setTokens((previous) => [...previous, token])
              }
              onRevoke={revoke}
              tokens={tokens}
            />
          ) : (
            <AppsOverview
              apps={apps}
              onCreate={createApp}
              onOpen={setOpenAppId}
              tokens={tokens}
            />
          )}
        </div>
      </AppShell>
    </MockupShell>
  )
}
