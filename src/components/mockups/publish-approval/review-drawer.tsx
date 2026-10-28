"use client"

import * as React from "react"

import { errorId, FieldHeader } from "@/components/design-system/field-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SideBySideDiff } from "@/components/shared/line-diff"
import {
  CloseIcon,
  NextRequestIcon,
  PreviousRequestIcon,
} from "@/components/mockups/publish-approval/icons"
import { StatusBadge } from "@/components/mockups/publish-approval/status-badge"
import {
  type ApprovalRequest,
  canDecide,
  type Viewer,
  who,
} from "@/lib/mockups/publish-approval-data"

export function ReviewDrawer({
  request,
  onClose,
  viewer,
  list,
  onStep,
  failApprove,
  onApprove,
  onReject,
  onWithdraw,
}: {
  request: ApprovalRequest | null
  onClose: () => void
  viewer: Viewer
  /** The requests ↑ and ↓ step through, in list order. */
  list: string[]
  onStep: (id: string) => void
  failApprove: boolean
  onApprove: (id: string) => Promise<boolean>
  onReject: (id: string, reason: string) => void
  onWithdraw: (id: string) => void
}) {
  const index = request ? list.indexOf(request.id) : -1
  const previous = index > 0 ? list[index - 1] : null
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null

  React.useEffect(() => {
    if (!request) return
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.closest("textarea, input")) return
      if (event.key === "ArrowUp" && previous) onStep(previous)
      if (event.key === "ArrowDown" && next) onStep(next)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [request, previous, next, onStep])

  return (
    <Drawer
      direction="right"
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      open={request !== null}
    >
      <DrawerContent className="sm:max-w-5xl!">
        {request ? (
          <Review
            failApprove={failApprove}
            key={request.id}
            next={next}
            onApprove={onApprove}
            onReject={onReject}
            onStep={onStep}
            onWithdraw={onWithdraw}
            previous={previous}
            request={request}
            viewer={viewer}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

function Review({
  request,
  viewer,
  previous,
  next,
  onStep,
  failApprove,
  onApprove,
  onReject,
  onWithdraw,
}: {
  request: ApprovalRequest
  viewer: Viewer
  previous: string | null
  next: string | null
  onStep: (id: string) => void
  failApprove: boolean
  onApprove: (id: string) => Promise<boolean>
  onReject: (id: string, reason: string) => void
  onWithdraw: (id: string) => void
}) {
  const [rejecting, setRejecting] = React.useState(false)
  const [approving, setApproving] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const attempts = React.useRef(0)

  const pending = request.status === "pending"
  const decides = canDecide(request, viewer)
  const mine = request.by === viewer.name
  const where = request.org

  async function approve() {
    setApproving(true)
    setFailed(false)
    attempts.current += 1
    const ok =
      failApprove && attempts.current === 1
        ? await new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(false), 900),
          )
        : await onApprove(request.id)
    setApproving(false)
    if (!ok) setFailed(true)
  }

  return (
    <>
      <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
        <div className="flex min-w-0 flex-col gap-0.5">
          <DrawerTitle className="tabular-nums">
            {request.item} · v{request.version}
          </DrawerTitle>
          <DrawerDescription>
            {where} · requested by {who(request.by, viewer, true)},{" "}
            {request.raised}
          </DrawerDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {pending && decides ? (
            <>
              <Button
                disabled={approving || rejecting}
                onClick={() => setRejecting(true)}
                variant="outline"
              >
                Reject
              </Button>
              <Button disabled={approving || rejecting} onClick={approve}>
                {approving ? <Spinner /> : null}
                {failed ? "Try again" : "Approve and publish"}
              </Button>
            </>
          ) : pending && mine ? (
            <Button onClick={() => onWithdraw(request.id)} variant="outline">
              Withdraw
            </Button>
          ) : pending ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex gap-2">
                  <Button disabled variant="outline">
                    Reject
                  </Button>
                  <Button disabled>Approve and publish</Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {`Only ${request.org}’s approvers can decide`}
              </TooltipContent>
            </Tooltip>
          ) : null}
          <Button
            aria-label="Previous request"
            disabled={!previous}
            onClick={() => previous && onStep(previous)}
            size="icon-sm"
            variant="ghost"
          >
            <PreviousRequestIcon />
          </Button>
          <Button
            aria-label="Next request"
            disabled={!next}
            onClick={() => next && onStep(next)}
            size="icon-sm"
            variant="ghost"
          >
            <NextRequestIcon />
          </Button>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </div>
      </DrawerHeader>

      <div className="flex flex-1 flex-col overflow-y-auto" data-vaul-no-drag>
        <div className="flex w-full max-w-3xl flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground tabular-nums">
            <StatusBadge status={request.status} />
            <Standing request={request} viewer={viewer} />
          </div>

          {failed ? (
            <Alert className="bg-destructive-tint" variant="destructive">
              <AlertTitle className="tabular-nums">
                Couldn’t approve v{request.version}
              </AlertTitle>
              <AlertDescription className="tabular-nums">
                Callers still hear v{request.live}. The request is still
                waiting.
              </AlertDescription>
            </Alert>
          ) : null}

          {rejecting ? (
            <RejectReason
              onCancel={() => setRejecting(false)}
              onReject={(reason) => onReject(request.id, reason)}
              version={request.version}
            />
          ) : null}

          {request.status === "rejected" && request.decision?.reason ? (
            <Block
              label={`Reason from ${who(request.decision.by, viewer, true)}`}
            >
              {request.decision.reason}
            </Block>
          ) : null}

          <Block label="What callers will notice">
            <span className="text-base">{request.summary}</span>
          </Block>

          <Block
            label={`Why it’s needed, from ${who(request.by, viewer, true)}`}
          >
            {request.note}
          </Block>

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Affects</dt>
            <dd>{`Every call to ${request.item}`}</dd>
            <dt className="text-muted-foreground">Version</dt>
            <dd className="tabular-nums">
              v{request.live} → v{request.version}
            </dd>
          </dl>

          <ExactChanges request={request} />
        </div>
      </div>
    </>
  )
}

function Standing({
  request,
  viewer,
}: {
  request: ApprovalRequest
  viewer: Viewer
}) {
  const decision = request.decision
  switch (request.status) {
    case "pending":
      return (
        <span>
          Waiting {request.waiting} · callers hear v{request.live} until it’s
          approved
        </span>
      )
    case "approved":
      return (
        <span>
          {who(decision!.by, viewer)}, {decision!.at} · callers hear v
          {request.version} from then
        </span>
      )
    case "rejected":
    case "withdrawn":
      return (
        <span>
          {who(decision!.by, viewer)}, {decision!.at}
        </span>
      )
  }
}

function Block({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-sm text-muted-foreground">{label}</h3>
      <p className="text-sm" dir="auto">
        {children}
      </p>
    </section>
  )
}

function RejectReason({
  version,
  onCancel,
  onReject,
}: {
  version: number
  onCancel: () => void
  onReject: (reason: string) => void
}) {
  const [reason, setReason] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)
  const error =
    submitted && reason.trim() === "" ? "Say what needs to change." : null

  return (
    <Card>
      <CardContent>
        <Field>
          <FieldHeader error={error} htmlFor="reject-reason">
            Why you’re rejecting it
          </FieldHeader>
          <Textarea
            aria-describedby={error ? errorId("reject-reason") : undefined}
            aria-invalid={error ? true : undefined}
            autoFocus
            dir="auto"
            id="reject-reason"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Keep the 1 to 10 scale until the branch reports switch over."
            rows={3}
            value={reason}
          />
        </Field>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          onClick={() => {
            setSubmitted(true)
            if (reason.trim()) onReject(reason.trim())
          }}
        >
          Reject v{version}
        </Button>
      </CardFooter>
    </Card>
  )
}

function ExactChanges({ request }: { request: ApprovalRequest }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Collapsible
      className="flex flex-col gap-4"
      onOpenChange={setOpen}
      open={open}
    >
      <CollapsibleTrigger asChild>
        <Button className="self-start" variant="outline">
          {open ? "Hide exact changes" : "Show exact changes"}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-6">
        {request.changes.map((change) => (
          <div className="flex flex-col gap-2" key={change.label}>
            <span className="text-sm font-medium">{change.label}</span>
            <div className="grid grid-cols-2 text-xs text-muted-foreground tabular-nums">
              <span className="px-3">
                v{request.live}
                {request.status === "pending" ? ", live" : ""}
              </span>
              <span className="px-3">v{request.version}</span>
            </div>
            <SideBySideDiff after={change.after} before={change.before} />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
