"use client"

import * as React from "react"

import { ScenarioIndex } from "@/components/mockups/live-scenarios/scenario-index"
import { type Notice, Notifications } from "@/components/shared/notifications"
import { AppShell } from "@/components/shell/app-shell"

const NOTICES: Notice[] = [
  {
    id: "bvs-14",
    title: "Ahmad Khalil wants to publish v14",
    detail: "Branch visit survey",
    at: "Today, 09:10",
  },
  {
    id: "inv-8",
    title: "Sami Rahman wants to publish v8",
    detail: "Invoices awaiting payment (outbound)",
    at: "10 Oct, 09:15",
  },
  {
    id: "wel-5",
    title: "Huda Al-Saud rejected v5",
    detail: "Welcome and onboarding (outbound)",
    at: "6 Oct, 11:20",
  },
]

/**
 * The bell in the app's own top bar, open over a real page so it is judged
 * where it lives. Framed like the admin view: `translate-x-0` makes the
 * frame the containing block for the app's fixed sidebar.
 *
 * The notices are DES-204's — approval is the first thing the product
 * notifies about. Clicking one marks it read; the page behind stays put.
 */
export function NotificationsPreview() {
  const [read, setRead] = React.useState<Set<string>>(new Set(["wel-5"]))

  return (
    <div className="relative flex h-180 translate-x-0 flex-col overflow-hidden rounded-xl border">
      <AppShell
        active="Scenarios"
        scope={
          <Notifications
            defaultOpen
            notices={NOTICES}
            onOpen={() => {}}
            onRead={(ids) =>
              setRead((current) => new Set([...current, ...ids]))
            }
            onViewAll={() => {}}
            read={read}
            viewAll="Approvals"
          />
        }
        underShell={false}
      >
        <ScenarioIndex />
      </AppShell>
    </div>
  )
}
