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
