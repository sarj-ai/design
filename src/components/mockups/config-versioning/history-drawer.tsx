"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Item } from "@/components/ui/item"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DiffStat, diffStat, FoldedDiff } from "@/components/shared/line-diff"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import {
  CloseIcon,
  EditFromIcon,
} from "@/components/mockups/config-versioning/icons"
import {
  type CaseId,
  DELETED_REFERENCE,
  type Subject,
  type Version,
} from "@/lib/mockups/config-versioning-data"
import { cn } from "@/lib/utils"

/** How many versions a page of history holds before Load more (TDD 3.6). */
const PAGE = 5

/** What applying or publishing came to. */
export type ApplyResult = "ok" | "failed" | "blocked"

/**
 * Version history as a record drawer — 1024px, the surfaces page's answer
 * for reading records opened from a list — because compare is side by side,
 * and two columns of prompt do not fit in 448.
 *
 * The list is newest first, a page at a time with Load more: number, who,
 * when, and the version it was edited from. The note, if one was left, is
 * read in the right pane, not the list (feedback, 22 Oct 2026). The
 * version callers get is marked "In use", never "Live" — live is only the
 * scenario's switch and badge (TDD 3.6). The pane on the right is the
 * selected version against the one it was edited from, or any other.
 *
 * Applying happens here, with the comparison on screen. On a live scenario
 * a version newer than the one in use is published and an older one is
 * applied, both after the extra warning (TDD 3.4); on a scenario that is
 * not live any version is applied straight away. Neither makes a version
 * (TDD 3.7). Edit from here copies a version into the editor; saving makes
 * a new one on top.
 */
export function HistoryDrawer({
  open,
  onOpenChange,
  subject,
  initial,
  caseId,
  canEdit,
  editing,
  onApply,
  onEditFrom,
  approval,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Subject
  /** The version to open on, and what to compare it with. */
  initial: { n: number; against: number | null }
  caseId: CaseId
  canEdit: boolean
  /** The version open in the editor — Edit from here is absent for it. */
  editing: number
  /** Puts a version in use. */
  onApply: (n: number) => Promise<ApplyResult>
  onEditFrom: (n: number) => void
  /** DES-204: publishing a live item needs an approval, so the apply
   *  action becomes a request. */
  approval?: Approval
}) {
  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-5xl!">
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="flex flex-col gap-0.5">
            <DrawerTitle>Version history</DrawerTitle>
            <DrawerDescription className="tabular-nums">
              {subject.name} · In use: v{subject.inUse}
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Keyed on open, so every opening loads afresh — and the failure
            case fails every time until Try again. */}
        {open ? (
          <HistoryBody
            approval={approval}
            canEdit={canEdit}
            caseId={caseId}
            editing={editing}
            initial={initial}
            key={`${initial.n}-${initial.against}`}
            onApply={onApply}
            onEditFrom={onEditFrom}
            subject={subject}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

type Load = "loading" | "failed" | "ready"

type Approval = {
  /** Who approves, in words — the client. */
  by: string
  /** The version already waiting, if one is. One request at a time. */
  pending: number | null
  onRequest: (n: number) => void
}

function HistoryBody({
  approval,
  subject,
  initial,
  caseId,
  canEdit,
  editing,
  onApply,
  onEditFrom,
}: {
  approval?: Approval
  subject: Subject
  initial: { n: number; against: number | null }
  caseId: CaseId
  canEdit: boolean
  editing: number
  onApply: (n: number) => Promise<ApplyResult>
  onEditFrom: (n: number) => void
}) {
  const [load, setLoad] = React.useState<Load>("loading")
  const [attempt, setAttempt] = React.useState(0)
  const [selected, setSelected] = React.useState(initial.n)
  const [against, setAgainst] = React.useState<number | null>(initial.against)
  /* Enough pages that the version asked for is on screen. */
  const [count, setCount] = React.useState(() => {
    const index = subject.versions.findIndex((item) => item.n === initial.n)
    return Math.max(PAGE, Math.ceil((index + 1) / PAGE) * PAGE)
  })
  const [loadingMore, setLoadingMore] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(
      () =>
        setLoad(
          caseId === "history-fails" && attempt === 0 ? "failed" : "ready",
        ),
      600,
    )
    return () => clearTimeout(timer)
  }, [attempt, caseId])

  if (load === "loading") return <ListSkeleton />

  if (load === "failed") {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Couldn’t load versions</EmptyTitle>
            <EmptyDescription>
              Nothing changed. The scenario and the version in use are as they
              were.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => {
                setLoad("loading")
                setAttempt((current) => current + 1)
              }}
              size="lg"
              variant="outline"
            >
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const shown = subject.versions.slice(0, count)
  const more = subject.versions.length - shown.length
  const version =
    subject.versions.find((item) => item.n === selected) ?? subject.versions[0]
  /* Against the version it was edited from, or the next one down when it
     has none. */
  const find = (n: number | null) =>
    subject.versions.find((item) => item.n === n) ?? null
  const compare =
    find(against === version.n ? null : against) ??
    find(version.editedFrom) ??
    subject.versions.find((item) => item.n < version.n) ??
    null

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-80 shrink-0 flex-col border-e">
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <ol className="flex flex-col gap-1">
            {shown.map((item, index) => (
              <VersionRow
                inUse={item.n === subject.inUse}
                key={item.n}
                last={index === shown.length - 1}
                latest={item.n === subject.versions[0].n}
                onSelect={() => {
                  setSelected(item.n)
                  setAgainst(null)
                }}
                selected={item.n === version.n}
                version={item}
              />
            ))}
          </ol>
          {more > 0 ? (
            <Button
              className="mt-2 w-full"
              disabled={loadingMore}
              onClick={() => {
                setLoadingMore(true)
                setTimeout(() => {
                  setCount((current) => current + PAGE)
                  setLoadingMore(false)
                }, 500)
              }}
              variant="ghost"
            >
              {loadingMore ? <Spinner /> : null}
              Load more
            </Button>
          ) : null}
        </div>
      </aside>

      <VersionPane
        against={compare}
        approval={approval}
        canEdit={canEdit}
        editing={editing}
        key={version.n}
        onAgainst={setAgainst}
        onApply={onApply}
        onEditFrom={onEditFrom}
        subject={subject}
        version={version}
      />
    </div>
  )
}

/**
 * One version on the timeline. A rail runs down the list with a dot per
 * version, filled green on the one in use, so the reader sees at a glance
 * which saves sit above it and which below. No box per row: the selected one
 * is a muted fill, as in a nav.
 */
function VersionRow({
  version,
  inUse,
  latest,
  last,
  selected,
  onSelect,
}: {
  version: Version
  inUse: boolean
  /** The newest save — the editor's "latest". */
  latest: boolean
  /** The rail stops at the last dot. */
  last: boolean
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li className="relative">
      {/* This row's stretch of the rail: from its dot to the next one, which
          sits 18px into the next row, past the 4px gap. */}
      {last ? null : (
        <span
          aria-hidden
          className="absolute start-3.5 top-4.5 -bottom-5.5 w-px bg-border"
        />
      )}
      <Item
        aria-current={selected ? "true" : undefined}
        asChild
        className={cn(
          "cursor-pointer flex-nowrap items-start text-start motion-reduce:transition-none",
          selected ? "bg-muted" : "hover:bg-muted/50",
        )}
        size="xs"
      >
        <button onClick={onSelect} type="button">
          {/* The dot sits on the rail. */}
          <span aria-hidden className="flex w-2 shrink-0 pt-1.5">
            <span
              className={cn(
                "relative size-2 rounded-full",
                inUse
                  ? "bg-success"
                  : selected
                    ? "bg-foreground"
                    : "border border-muted-foreground/50 bg-background",
              )}
            />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-2 font-medium tabular-nums">
              v{version.n}
              {inUse ? (
                <Badge
                  className="bg-success-tint text-success-tint-foreground"
                  variant="secondary"
                >
                  In use
                </Badge>
              ) : latest ? (
                /* Named only while it differs from the one in use: the two
                   words the editor uses, so History is where they meet a
                   number. */
                <Badge variant="outline">Latest</Badge>
              ) : null}
              <span className="ms-auto text-xs font-normal text-muted-foreground">
                {version.at}
              </span>
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {version.author}
              {version.editedFrom ? ` · from v${version.editedFrom}` : ""}
            </span>
          </span>
        </button>
      </Item>
    </li>
  )
}

function VersionPane({
  approval,
  subject,
  version,
  against,
  onAgainst,
  canEdit,
  editing,
  onApply,
  onEditFrom,
}: {
  approval?: Approval
  subject: Subject
  version: Version
  against: Version | null
  onAgainst: (n: number) => void
  canEdit: boolean
  editing: number
  onApply: (n: number) => Promise<ApplyResult>
  onEditFrom: (n: number) => void
}) {
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<ApplyResult | null>(null)
  const [confirming, setConfirming] = React.useState(false)
  const inUse = subject.inUse
  const isInUse = version.n === inUse

  /* Publish for a version newer than the one in use on a live scenario,
     Apply for everything else. Neither makes a version. Absent on the
     version in use, and while a request is waiting (DES-204). */
  const verb = subject.live && version.n > inUse ? "Publish" : "Apply"
  const action =
    isInUse || (approval && approval.pending !== null)
      ? null
      : approval
        ? "Request approval"
        : `${verb} v${version.n}`

  async function apply() {
    if (approval) {
      approval.onRequest(version.n)
      return
    }
    setConfirming(false)
    setBusy(true)
    setResult(null)
    const outcome = await onApply(version.n)
    setBusy(false)
    if (outcome !== "ok") setResult(outcome)
  }

  const [view, setView] = React.useState<"changes" | "version">("changes")
  /* Every time this version was put in use, newest first (TDD 3.2). A save
     that put it in use is left out: who saved it and when is the line
     above. */
  const record = subject.log.filter(
    (entry) => entry.n === version.n && entry.how !== "saved",
  )

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      {/* The version, its note, who saved it, and who put it in use. What
          is in use now and what changed are said once each — by the badge
          and by the comparison below — not again in a strip of facts. */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold tabular-nums">
            v{version.n}
            {isInUse ? (
              <Badge
                className="bg-success-tint text-success-tint-foreground"
                variant="secondary"
              >
                In use
              </Badge>
            ) : null}
          </h2>
          {version.note ? <p className="text-sm">{version.note}</p> : null}
          <p className="text-sm text-muted-foreground tabular-nums">
            {version.author} · {version.at}
          </p>
          {record.map((entry) => (
            <p
              className="text-sm text-muted-foreground tabular-nums"
              key={`${entry.how}-${entry.at}`}
            >
              {entry.how === "published" ? "Published" : "Applied"} by{" "}
              {entry.by === "You" ? "you" : entry.by}, {entry.at}
            </p>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {approval && approval.pending !== null && !isInUse ? (
            <span className="text-sm text-muted-foreground tabular-nums">
              v{approval.pending} is waiting for approval
            </span>
          ) : null}
          {version.n === editing ? null : (
            <Permission allowed={canEdit}>
              <Button
                disabled={!canEdit || busy}
                onClick={() => onEditFrom(version.n)}
                variant="outline"
              >
                <EditFromIcon />
                Edit from here
              </Button>
            </Permission>
          )}
          {action ? (
            <Permission allowed={canEdit}>
              <Button
                disabled={!canEdit || busy || result === "blocked"}
                onClick={() => {
                  /* The extra warning is for live scenarios only (TDD
                     3.4); a retry after a failure has had it already. */
                  if (subject.live && !approval && result === null) {
                    setConfirming(true)
                    return
                  }
                  void apply()
                }}
              >
                {busy ? <Spinner /> : null}
                {result === "failed" ? "Try again" : action}
              </Button>
            </Permission>
          ) : null}
        </div>
      </div>

      {result === "failed" ? (
        <Alert className="bg-destructive-tint" variant="destructive">
          <AlertTitle>
            Couldn’t {verb.toLowerCase()} v{version.n}
          </AlertTitle>
          <AlertDescription>
            v{inUse} is still in use. Nothing else changed.
          </AlertDescription>
        </Alert>
      ) : result === "blocked" ? (
        <Alert className="bg-destructive-tint" variant="destructive">
          <AlertTitle>
            Can’t {verb.toLowerCase()} v{version.n}
          </AlertTitle>
          <AlertDescription>
            It uses {DELETED_REFERENCE}, which was deleted from this scenario. v
            {inUse} is still in use. To keep this version’s wording, edit from
            here and save.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Changes against another version (the edited-from one unless
          picked), or the version whole, as it was (TDD 3.6). One diff
          layout — split, as the platform's change summary has it. The very
          first version has nothing to compare, so it is only shown whole. */}
      {against ? (
        <SecondaryTabs
          aside={
            view === "changes" ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Compared with
                </span>
                <Select
                  onValueChange={(value) => onAgainst(Number(value))}
                  value={String(against.n)}
                >
                  <SelectTrigger aria-label="Changes from" size="sm">
                    {/* The trigger names the version; what it is (in use,
                        edited from) is said in the list. */}
                    <SelectValue>v{against.n}</SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {subject.versions
                      .filter((item) => item.n !== version.n)
                      .map((item) => (
                        <SelectItem key={item.n} value={String(item.n)}>
                          <span className="tabular-nums">v{item.n}</span>
                          {item.n === inUse ? (
                            <span className="text-muted-foreground">
                              In use
                            </span>
                          ) : null}
                          {item.n === version.editedFrom ? (
                            <span className="text-muted-foreground">
                              Edited from
                            </span>
                          ) : null}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ) : undefined
          }
          items={[
            { id: "changes", label: "Changes" },
            { id: "version", label: "Full version" },
          ]}
          onValueChange={(value) => setView(value as "changes" | "version")}
          value={view}
        >
          {view === "changes" ? (
            <div className="flex flex-col gap-3">
              {/* Every field gets a band, so an unchanged one still says so,
                  and only the changed ones open into a diff. */}
              {subject.fields.map((field) => {
                const before = against.body[field.id]
                const after = version.body[field.id]
                const same = before === after
                return (
                  <div
                    className="overflow-hidden rounded-lg border"
                    key={field.id}
                  >
                    <FieldBand label={field.label} open={!same}>
                      {same ? (
                        <span className="font-normal text-muted-foreground">
                          Unchanged
                        </span>
                      ) : (
                        <DiffStat {...diffStat(before, after)} />
                      )}
                    </FieldBand>
                    {same ? null : (
                      <FoldedDiff
                        after={after}
                        bare
                        before={before}
                        key={against.n}
                        layout="split"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <FullVersion subject={subject} version={version} />
          )}
        </SecondaryTabs>
      ) : (
        <FullVersion subject={subject} version={version} />
      )}

      {/* The extra warning on a live scenario (TDD 3.4). It names the
          version, what callers get and when, and that the prompt and first
          message travel together (TDD 3.5). */}
      <AlertDialog onOpenChange={setConfirming} open={confirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verb} v{version.n}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {subject.name} is live. Callers get v{version.n}’s prompt and
              first message from the next call. Calls already running finish on
              v{inUse}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void apply()}>
              {verb} v{version.n}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

/** A field's title band, with what it says about the field at the end. */
function FieldBand({
  label,
  open,
  children,
}: {
  label: string
  /** Something sits under it, so it draws its bottom edge. */
  open: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 bg-muted/60 px-3 py-2 text-xs font-medium",
        open && "border-b",
      )}
    >
      <span>{label}</span>
      {children}
    </div>
  )
}

/** The version whole, as it was: each field read-only, in full. */
function FullVersion({
  subject,
  version,
}: {
  subject: Subject
  version: Version
}) {
  return (
    <div className="flex flex-col gap-3">
      {subject.fields.map((field) => (
        <div className="overflow-hidden rounded-lg border" key={field.id}>
          <FieldBand label={field.label} open />
          <p className="px-3 py-2 text-xs whitespace-pre-wrap" dir="auto">
            {version.body[field.id]}
          </p>
        </div>
      ))}
    </div>
  )
}

/** A greyed action says why on hover, as DES-203's Live switch does. */
function Permission({
  allowed,
  children,
}: {
  allowed: boolean
  children: React.ReactNode
}) {
  if (allowed) return <>{children}</>
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent>You can view versions but not change them</TooltipContent>
    </Tooltip>
  )
}

function ListSkeleton() {
  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-80 shrink-0 flex-col gap-2 border-e p-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton
            className="h-16 w-full motion-reduce:animate-none"
            key={index}
          />
        ))}
      </aside>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-5 w-40 motion-reduce:animate-none" />
        <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
        <Skeleton className="h-40 w-full motion-reduce:animate-none" />
      </div>
    </div>
  )
}
