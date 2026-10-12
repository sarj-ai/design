"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScenarioIndex } from "@/components/mockups/live-scenarios/scenario-index"
import { ApprovalEditor } from "@/components/mockups/publish-approval/approval-editor"
import { ApprovalsPage } from "@/components/mockups/publish-approval/approvals-page"
import { ApprovalsIcon } from "@/components/mockups/publish-approval/icons"
import { ReviewDrawer } from "@/components/mockups/publish-approval/review-drawer"
import { StatusBadge } from "@/components/mockups/publish-approval/status-badge"
import { type Notice, Notifications } from "@/components/shared/notifications"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import type { Subject } from "@/lib/mockups/config-versioning-data"
import { SCENARIOS, type ScenarioRow } from "@/lib/mockups/live-scenarios-data"
import {
  type ApprovalRequest,
  CASES,
  type CaseId,
  canDecide,
  canSee,
  changesBetween,
  forViewer,
  mainRequest,
  OTHER_REQUESTS,
  SCENARIO,
  type ViewerId,
  VIEWERS,
  who,
  withV15,
} from "@/lib/mockups/publish-approval-data"

/**
 * Publish approval — DES-204, under INT-253, for PLT-4477. The spec is the
 * "Publish approval" requirements doc and its two mockups (the Approvals
 * page and the bell); it sits on DES-202's versions (/config-versioning).
 *
 * One state, three people. The reviewer switches between the requester
 * (Sarj), the client's approver and a super admin, and the same request
 * moves between them: send it as Ahmad, approve or reject it as Yusuf, see
 * the outcome as Ahmad. The views are the three places approval shows up —
 * the scenario editor, the scenarios index and Approvals — and the state
 * select reaches the cases the ticket names directly.
 */

const VIEWS = [
  { id: "editor", label: "Scenario" },
  { id: "index", label: "Scenarios" },
  { id: "approvals", label: "Approvals" },
] as const

type View = (typeof VIEWS)[number]["id"]

type World = { subject: Subject; requests: ApprovalRequest[] }

function initialWorld(caseId: CaseId): World {
  const others = caseId === "empty" ? [] : OTHER_REQUESTS
  switch (caseId) {
    case "pending":
    case "approve-fails":
      return {
        subject: SCENARIO,
        requests: [mainRequest("pending"), ...others],
      }
    case "newer":
      return {
        subject: withV15(SCENARIO),
        requests: [mainRequest("pending"), ...others],
      }
    case "rejected":
      return {
        subject: SCENARIO,
        requests: [
          mainRequest("rejected", 14, {
            by: "Yusuf Al-Amri",
            at: "Today, 11:02",
            reason:
              "Keep the 1 to 10 scale until the branch reports switch over on 1 November.",
          }),
          ...others,
        ],
      }
    default:
      return { subject: SCENARIO, requests: others }
  }
}

/** The index row for the scenario the editor shows, above DES-203's rows. */
const SCENARIO_ROW: ScenarioRow = {
  id: "bvs",
  name: SCENARIO.name,
  languages: ["AR", "EN"],
  created: "14 Sep 2026, 10:20",
  updated: "12 Oct 2026, 14:02",
  updatedBy: "akhalil",
  live: { by: "Nouf Al-Harbi", at: "15 Sep 2026, 09:00" },
}

export default function PublishApprovalPage() {
  const [caseId, setCaseId] = React.useState<CaseId>("normal")
  const [viewerId, setViewerId] = React.useState<ViewerId>("requester")
  const [view, setView] = React.useState<View>("editor")
  const [world, setWorld] = React.useState(() => initialWorld("normal"))
  const [open, setOpen] = React.useState<{ id: string; list: string[] } | null>(
    null,
  )
  const [read, setRead] = React.useState<Set<string>>(new Set())
  const viewer = VIEWERS.find((entry) => entry.id === viewerId)!

  /* A toast belongs to the case and person that raised it. */
  React.useEffect(() => {
    toast.dismiss()
  }, [caseId, viewerId])

  function pickCase(next: CaseId) {
    setCaseId(next)
    setWorld(initialWorld(next))
    setOpen(null)
    setRead(new Set())
    if (next === "approve-fails") setViewerId("approver")
    if (next === "load-fails" || next === "empty") setView("approvals")
    if (next !== "load-fails" && next !== "empty" && view === "approvals")
      setView("editor")
  }

  const { subject, requests } = world
  const visible = requests.filter((request) => canSee(request, viewer))
  const mine = requests.filter((request) => request.item === subject.name)
  const waitingOnMe = visible.filter(
    (request) => request.status === "pending" && canDecide(request, viewer),
  )

  /* An approver hears a request is waiting; a requester hears theirs was
     decided by someone else. */
  const notices: Notice[] = [
    ...waitingOnMe.map((request) => ({
      id: request.id,
      title:
        request.kind === "global"
          ? `Global prompt v${request.version} is waiting for your review`
          : `${who(request.by, viewer)} wants to publish v${request.version}`,
      detail: request.org ? request.item : "Every organization",
      at: request.raised,
    })),
    ...visible
      .filter(
        (request) =>
          request.by === viewer.name &&
          (request.status === "approved" || request.status === "rejected") &&
          request.decision &&
          request.decision.by !== viewer.name,
      )
      .map((request) => ({
        id: request.id,
        title: `${request.decision!.by} ${request.status} v${request.version}`,
        detail: request.item,
        at: request.decision!.at,
      })),
  ]

  /* ------------------------------------------------------------ actions */

  function update(id: string, change: Partial<ApprovalRequest>) {
    setWorld((current) => ({
      ...current,
      requests: current.requests.map((request) =>
        request.id === id ? { ...request, ...change } : request,
      ),
    }))
  }

  function save(body: Record<string, string>, editedFrom: number) {
    const n = subject.versions[0].n + 1
    setWorld((current) => ({
      ...current,
      subject: {
        ...current.subject,
        versions: [
          {
            n,
            author: viewer.name,
            mine: true,
            at: "Just now",
            editedFrom,
            summary: "Saved just now.",
            everLive: false,
            body,
          },
          ...current.subject.versions,
        ],
      },
    }))
    return n
  }

  async function request(input: {
    version: number
    summary: string
    note: string
  }) {
    await new Promise((resolve) => setTimeout(resolve, 900))
    const live = subject.marker ?? input.version
    const made: ApprovalRequest = {
      id: `bvs-${input.version}-${requests.length}`,
      kind: "scenario",
      item: subject.name,
      org: "Riyad Bank",
      version: input.version,
      live,
      by: viewer.name,
      raised: "Just now",
      waiting: "under a minute",
      note: input.note,
      summary: input.summary,
      changes: changesBetween(subject, live, input.version),
      status: "pending",
      decision: null,
    }
    setWorld((current) => ({
      ...current,
      /* One request at a time: a new one withdraws the one waiting. */
      requests: [
        made,
        ...current.requests.map((item) =>
          item.item === subject.name && item.status === "pending"
            ? {
                ...item,
                status: "withdrawn" as const,
                decision: { by: viewer.name, at: "Just now" },
              }
            : item,
        ),
      ],
    }))
    return true
  }

  async function approve(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 900))
    const target = requests.find((item) => item.id === id)
    if (!target) return false
    const before = world
    setWorld((current) => ({
      requests: current.requests.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "approved",
              decision: { by: viewer.name, at: "Just now" },
            }
          : item,
      ),
      /* Approving publishes: the marker moves, and no version is made. */
      subject:
        target.item === current.subject.name
          ? {
              ...current.subject,
              marker: target.version,
              published: { by: viewer.name, at: "Just now" },
              versions: current.subject.versions.map((version) =>
                version.n === target.version
                  ? { ...version, everLive: true }
                  : version,
              ),
            }
          : current.subject,
    }))
    setOpen(null)
    toast.success(`v${target.version} is live`, {
      description: `Callers of ${target.item} hear it from the next call.`,
      action: { label: "Undo", onClick: () => setWorld(before) },
    })
    return true
  }

  function reject(id: string, reason: string) {
    const target = requests.find((item) => item.id === id)
    update(id, {
      status: "rejected",
      decision: { by: viewer.name, at: "Just now", reason },
    })
    setOpen(null)
    toast(`Rejected v${target?.version}`, {
      description: `${target ? who(target.by, viewer) : "The requester"} sees your reason. Callers keep hearing v${target?.live}.`,
    })
  }

  function withdraw(id: string) {
    const target = requests.find((item) => item.id === id)
    update(id, {
      status: "withdrawn",
      decision: { by: viewer.name, at: "Just now" },
    })
    setOpen(null)
    toast(`Request for v${target?.version} withdrawn`, {
      action: {
        label: "Undo",
        onClick: () => update(id, { status: "pending", decision: null }),
      },
    })
  }

  function toggleLive(on: boolean) {
    setWorld((current) => ({
      ...current,
      subject: {
        ...current.subject,
        marker: on ? current.subject.versions[0].n : null,
        published: on ? { by: viewer.name, at: "Just now" } : null,
      },
    }))
  }

  /* -------------------------------------------------------------- page */

  const shown = open
    ? (requests.find((item) => item.id === open.id) ?? null)
    : null

  return (
    <MockupShell
      actions={
        <>
          <Select
            onValueChange={(value) => setViewerId(value as ViewerId)}
            value={viewerId}
          >
            <SelectTrigger aria-label="Viewing as" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              {VIEWERS.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => pickCase(value as CaseId)}
            value={caseId}
          >
            <SelectTrigger aria-label="State" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              {CASES.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            aria-label="View"
            onValueChange={(next) => {
              if (next) setView(next as View)
            }}
            size="sm"
            type="single"
            value={view}
            variant="outline"
          >
            {VIEWS.map((entry) => (
              <ToggleGroupItem key={entry.id} value={entry.id}>
                {entry.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </>
      }
      title="Publish approval for live scenario changes"
    >
      <TooltipProvider>
        <AppShell
          active={view === "approvals" ? "Approvals" : "Scenarios"}
          addedItems={[
            {
              after: "Tasks",
              item: {
                icon: ApprovalsIcon,
                title: "Approvals",
                badge: waitingOnMe.length,
              },
            },
          ]}
          breadcrumb={
            view === "editor"
              ? ["Scenarios", subject.name]
              : view === "index"
                ? "Scenarios"
                : "Approvals"
          }
          onNavigate={(title) => {
            if (title === "Scenarios") setView("index")
            if (title === "Approvals") setView("approvals")
          }}
          scope={
            <Notifications
              notices={notices}
              onOpen={(id) => setOpen({ id, list: [id] })}
              onRead={(ids) =>
                setRead((current) => new Set([...current, ...ids]))
              }
              onViewAll={() => setView("approvals")}
              viewAll="Approvals"
              read={read}
            />
          }
        >
          {view === "editor" ? (
            <ApprovalEditor
              caseId={caseId}
              key={`${caseId}-${viewerId}`}
              onOpenRequest={(id) => setOpen({ id, list: [id] })}
              onRequest={request}
              onSave={save}
              onToggleLive={toggleLive}
              requests={mine}
              subject={forViewer(subject, viewer)}
              viewer={viewer}
            />
          ) : view === "index" ? (
            <ScenarioIndex
              marker={(row) => {
                const waiting = requests.find(
                  (item) => item.item === row.name && item.status === "pending",
                )
                if (!waiting) return null
                /* The chip is the flag; which version, and for how long,
                   is a hover away rather than another column. */
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex" tabIndex={0}>
                        <StatusBadge status="pending" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="tabular-nums">
                      v{waiting.version} waiting {waiting.waiting} for{" "}
                      {waiting.org}’s approval
                    </TooltipContent>
                  </Tooltip>
                )
              }}
              rows={[SCENARIO_ROW, ...SCENARIOS]}
            />
          ) : (
            <ApprovalsPage
              caseId={caseId}
              key={`${caseId}-${viewerId}`}
              onOpen={(id, list) => setOpen({ id, list })}
              requests={visible}
              viewer={viewer}
            />
          )}

          <ReviewDrawer
            failApprove={caseId === "approve-fails"}
            list={open?.list ?? []}
            onApprove={approve}
            onClose={() => setOpen(null)}
            onReject={reject}
            onStep={(id) => setOpen((current) => current && { ...current, id })}
            onWithdraw={withdraw}
            request={shown}
            viewer={viewer}
          />
        </AppShell>
      </TooltipProvider>
    </MockupShell>
  )
}
