"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EditorHeader } from "@/components/mockups/config-versioning/editor-header"
import { HistoryDrawer } from "@/components/mockups/config-versioning/history-drawer"
import { SaveReview } from "@/components/mockups/config-versioning/save-review"
import { RequestDialog } from "@/components/mockups/publish-approval/request-dialog"
import type { Subject, Version } from "@/lib/mockups/config-versioning-data"
import {
  type ApprovalRequest,
  type CaseId,
  canDecide,
  SCENARIO_ORG,
  type Viewer,
  who,
} from "@/lib/mockups/publish-approval-data"

export function ApprovalEditor({
  subject,
  viewer,
  caseId,
  requests,
  onSave,
  onToggleLive,
  onRequest,
  onOpenRequest,
}: {
  subject: Subject
  viewer: Viewer
  caseId: CaseId
  /** Newest first. */
  requests: ApprovalRequest[]
  onSave: (
    body: Record<string, string>,
    editedFrom: number,
    note: string,
  ) => number
  onToggleLive: (on: boolean) => void
  /** Resolves false when sending failed. */
  onRequest: (request: {
    version: number
    summary: string
    note: string
  }) => Promise<boolean>
  onOpenRequest: (id: string) => void
}) {
  const newest = subject.versions[0]
  const [base, setBase] = React.useState(newest.n)
  const [draft, setDraft] = React.useState(newest.body)
  const [reviewing, setReviewing] = React.useState(false)
  const [history, setHistory] = React.useState(false)
  const [requestFor, setRequestFor] = React.useState<number | null>(null)

  const canEdit = caseId !== "view-only"
  const inUse = subject.inUse
  const pending = requests.find((request) => request.status === "pending")
  const rejected =
    !pending && requests[0]?.status === "rejected" ? requests[0] : null
  const ahead = subject.live ? subject.versions.filter((v) => v.n > inUse) : []
  const changes = subject.fields.filter(
    (field) => draft[field.id] !== newest.body[field.id],
  ).length

  function save(note: string) {
    const n = onSave(draft, base, note)
    setBase(n)
    setReviewing(false)
    toast.success(`Saved as v${n}`, {
      description: pending
        ? `It isn’t in the request for v${pending.version}. Callers still hear v${inUse}.`
        : `Callers still hear v${inUse}.`,
    })
  }

  function discard() {
    setDraft(newest.body)
    setBase(newest.n)
  }

  async function send(request: { summary: string; note: string }) {
    if (requestFor === null) return false
    const ok = await onRequest({ version: requestFor, ...request })
    if (ok) {
      toast.success(`Request sent to ${SCENARIO_ORG}`, {
        description: `Callers hear v${requestFor} once it’s approved.`,
      })
      setRequestFor(null)
    }
    return ok
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8 pb-28">
      <EditorHeader
        base={base}
        canEdit={canEdit}
        onOpenHistory={() => setHistory(true)}
        onToggleLive={onToggleLive}
        subject={subject}
      />

      <StatusRow
        ahead={ahead}
        canRequest={canEdit}
        inUse={inUse}
        live={subject.live}
        newest={newest.n}
        onOpenRequest={onOpenRequest}
        onRequest={setRequestFor}
        pending={pending ?? null}
        rejected={rejected}
        viewer={viewer}
      />

      <FieldGroup>
        {subject.fields.map((field) => {
          const Control = field.multiline ? Textarea : Input
          return (
            <Field key={field.id}>
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              <Control
                dir="auto"
                disabled={!canEdit}
                id={field.id}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field.id]: event.target.value,
                  }))
                }
                {...(field.multiline ? { rows: 6 } : {})}
                value={draft[field.id]}
              />
            </Field>
          )
        })}
      </FieldGroup>

      {changes > 0 ? (
        <Card className="sticky bottom-4" size="sm">
          <CardContent className="flex items-center gap-3">
            <span className="text-sm tabular-nums">
              {changes === 1 ? "1 change" : `${changes} changes`}
            </span>
            <div className="ms-auto flex items-center gap-2">
              <Button onClick={discard} variant="ghost">
                Discard
              </Button>
              <Button onClick={() => setReviewing(true)}>
                Review and save
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <SaveReview
        base={base}
        draft={draft}
        liveLine={
          pending
            ? `Saving makes v${newest.n + 1}. It isn’t added to the request for v${pending.version}, and callers keep hearing v${inUse}.`
            : `Saving makes v${newest.n + 1}. Callers keep hearing v${inUse} until ${SCENARIO_ORG} approves a newer version.`
        }
        onOpenChange={setReviewing}
        onSave={save}
        open={reviewing}
        rival={null}
        subject={subject}
      />

      <HistoryDrawer
        approval={{
          by: SCENARIO_ORG,
          pending: pending?.version ?? null,
          onRequest: (n) => {
            setHistory(false)
            setRequestFor(n)
          },
        }}
        canEdit={canEdit}
        caseId="normal"
        editing={base}
        initial={{
          n: newest.n,
          against: inUse === newest.n ? null : inUse,
        }}
        onEditFrom={(n) => {
          const version = subject.versions.find((item) => item.n === n)
          if (!version) return
          setBase(n)
          setDraft(version.body)
          setHistory(false)
        }}
        onOpenChange={setHistory}
        onApply={async () => "failed"}
        open={history}
        subject={subject}
      />

      <RequestDialog
        caseId={caseId}
        live={inUse}
        onOpenChange={(open) => {
          if (!open) setRequestFor(null)
        }}
        onSend={send}
        open={requestFor !== null}
        org={SCENARIO_ORG}
        replacing={pending?.version ?? null}
        version={requestFor ?? newest.n}
      />
    </main>
  )
}

function StatusRow({
  ahead,
  inUse,
  live,
  newest,
  pending,
  rejected,
  viewer,
  canRequest,
  onRequest,
  onOpenRequest,
}: {
  ahead: Version[]
  inUse: number
  live: boolean
  newest: number
  pending: ApprovalRequest | null
  rejected: ApprovalRequest | null
  viewer: Viewer
  canRequest: boolean
  onRequest: (n: number) => void
  onOpenRequest: (id: string) => void
}) {
  if (!live) return null

  const request = (label: string, n: number) => (
    <RequestButton allowed={canRequest} onClick={() => onRequest(n)}>
      {label}
    </RequestButton>
  )

  if (pending) {
    const decides = canDecide(pending, viewer)
    const newer = newest > pending.version
    return (
      <Item variant="outline">
        <ItemContent>
          <ItemTitle className="tabular-nums">
            v{pending.version} is waiting for{" "}
            {decides ? "your" : `${SCENARIO_ORG}’s`} approval
          </ItemTitle>
          <ItemDescription className="tabular-nums">
            {newer
              ? `v${newest} was saved after the request and isn’t in it. Callers hear v${inUse}.`
              : `Requested by ${who(pending.by, viewer, true)}, ${pending.raised} · waiting ${pending.waiting}. Callers hear v${inUse}.`}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            onClick={() => onOpenRequest(pending.id)}
            variant={decides || newer ? "outline" : "default"}
          >
            {decides ? "Review" : "View request"}
          </Button>
          {newer && !decides
            ? request(`Request v${newest} instead`, newest)
            : null}
        </ItemActions>
      </Item>
    )
  }

  if (rejected?.decision) {
    return (
      <Item variant="outline">
        <ItemContent>
          <ItemTitle className="tabular-nums">
            {who(rejected.decision.by, viewer)} rejected v{rejected.version}
          </ItemTitle>
          <ItemDescription className="tabular-nums" dir="auto">
            “{rejected.decision.reason}” Callers hear v{inUse}.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button onClick={() => onOpenRequest(rejected.id)} variant="outline">
            View request
          </Button>
          {ahead.length > 0 ? request("Request approval", newest) : null}
        </ItemActions>
      </Item>
    )
  }

  if (ahead.length === 0) return null

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle className="tabular-nums">
          {ahead.length === 1
            ? `v${ahead[0].n} isn’t in use yet`
            : `v${ahead[ahead.length - 1].n} to v${ahead[0].n} aren’t in use yet`}
        </ItemTitle>
        <ItemDescription className="tabular-nums">
          Callers hear v{inUse} until {SCENARIO_ORG} approves a newer version.
        </ItemDescription>
      </ItemContent>
      <ItemActions>{request("Request approval", newest)}</ItemActions>
    </Item>
  )
}

function RequestButton({
  allowed,
  onClick,
  children,
}: {
  allowed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  if (allowed) return <Button onClick={onClick}>{children}</Button>
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex">
          <Button disabled>{children}</Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        You can view this scenario but not change it
      </TooltipContent>
    </Tooltip>
  )
}
