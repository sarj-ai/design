"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import { CallDrawer } from "@/components/mockups/review-tracking/call-drawer"
import { ConversationsFrame } from "@/components/mockups/review-tracking/conversations-frame"
import { ReviewTable } from "@/components/mockups/review-tracking/review-table"
import type { CallRow } from "@/lib/mockups/conversations-revamp-list-data"
import {
  CALL_IDS,
  REVIEW_CALLS,
  REVIEWED,
} from "@/lib/mockups/review-tracking-data"

function useOpenCall() {
  const [open, setOpen] = React.useState<CallRow | null>(null)
  return { open, show: setOpen, close: () => setOpen(null) }
}

export function ElevenLabsIdea() {
  const { open, show, close } = useOpenCall()

  return (
    <ConversationsFrame calls={REVIEW_CALLS}>
      {(rows) => (
        <>
          <ReviewTable calls={rows} onOpen={show} />
          <CallDrawer
            actions={
              open ? (
                <span className="text-sm text-muted-foreground tabular-nums">
                  {rows.findIndex((row) => row.id === open.id) + 1} /{" "}
                  {rows.length}
                </span>
              ) : null
            }
            call={open}
            calls={rows}
            onClose={close}
            onStep={show}
          />
        </>
      )}
    </ConversationsFrame>
  )
}

const VAPI_TABS: {
  id: string
  label: string
  match: (call: CallRow) => boolean
}[] = [
  { id: "all", label: "All calls", match: () => true },
  {
    id: "transferred",
    label: "Transferred",
    match: (call) => call.status === "transferred",
  },
  {
    id: "successful",
    label: "Successful",
    match: (call) => call.outcome === "met",
  },
  {
    id: "failed",
    label: "Failed",
    match: (call) => call.outcome === "not_met",
  },
]

export function VapiIdea() {
  const [tab, setTab] = React.useState("all")
  const { open, show, close } = useOpenCall()
  const match = VAPI_TABS.find((entry) => entry.id === tab)?.match

  return (
    <ConversationsFrame
      above={
        <SecondaryTabs
          items={VAPI_TABS.map((entry) => ({
            id: entry.id,
            label: `${entry.label} ${REVIEW_CALLS.filter(entry.match).length}`,
          }))}
          onValueChange={setTab}
          value={tab}
        >
          {null}
        </SecondaryTabs>
      }
      calls={REVIEW_CALLS}
      narrow={(rows) => (match ? rows.filter(match) : rows)}
    >
      {(rows) => (
        <>
          <ReviewTable
            before={[
              {
                id: "call-id",
                head: "Call ID",
                className: "text-sm text-muted-foreground tabular-nums",
                cell: (call) => `${CALL_IDS[call.id].slice(0, 8)}…`,
              },
            ]}
            calls={rows}
            onOpen={show}
          />
          <CallDrawer
            call={open}
            calls={rows}
            description={
              open ? `${CALL_IDS[open.id]} · ${open.scenario}` : undefined
            }
            onClose={close}
            onStep={show}
          />
        </>
      )}
    </ConversationsFrame>
  )
}

export function IntercomIdea() {
  const [closed, setClosed] = React.useState<string[]>(REVIEWED)
  const [tab, setTab] = React.useState("open")
  const { open, show, close } = useOpenCall()
  const openCount = REVIEW_CALLS.filter(
    (call) => !closed.includes(call.id),
  ).length

  function toggle(call: CallRow) {
    const isClosed = closed.includes(call.id)
    setClosed((list) =>
      isClosed ? list.filter((id) => id !== call.id) : [...list, call.id],
    )
    if (!isClosed) {
      toast("Conversation closed", {
        action: {
          label: "Undo",
          onClick: () =>
            setClosed((list) => list.filter((id) => id !== call.id)),
        },
      })
    }
  }

  return (
    <ConversationsFrame
      above={
        <SecondaryTabs
          items={[
            { id: "open", label: `Open ${openCount}` },
            {
              id: "closed",
              label: `Closed ${REVIEW_CALLS.length - openCount}`,
            },
          ]}
          onValueChange={setTab}
          value={tab}
        >
          {null}
        </SecondaryTabs>
      }
      calls={REVIEW_CALLS}
      narrow={(rows) =>
        rows.filter((row) => closed.includes(row.id) === (tab === "closed"))
      }
    >
      {(rows) => (
        <>
          <ReviewTable calls={rows} onOpen={show} />
          <CallDrawer
            actions={
              open ? (
                <Button
                  onClick={() => toggle(open)}
                  size="sm"
                  variant="outline"
                >
                  {closed.includes(open.id) ? "Reopen" : "Close conversation"}
                </Button>
              ) : null
            }
            call={open}
            calls={REVIEW_CALLS.filter(
              (row) =>
                closed.includes(row.id) === (tab === "closed") ||
                row.id === open?.id,
            )}
            onClose={close}
            onStep={show}
          />
        </>
      )}
    </ConversationsFrame>
  )
}
