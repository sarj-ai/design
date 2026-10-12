"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DiffStat, diffStat, FoldedDiff } from "@/components/shared/line-diff"
import { ToggleFilter } from "@/components/shared/filter-bar"
import { OrbAvatar } from "@/components/shared/orb-avatar"
import {
  CloseIcon,
  EditFromIcon,
} from "@/components/mockups/config-versioning/icons"
import type {
  CaseId,
  Subject,
  Version,
} from "@/lib/mockups/config-versioning-data"
import { cn } from "@/lib/utils"

/**
 * Version history as a record drawer — 1024px, the surfaces page's answer
 * for reading records opened from a list — because the PRD's compare is
 * side by side, and two columns of prompt do not fit in 448.
 *
 * The list is newest first: number, author, time, summary, and on anything
 * live whether each version has ever been live, with Live on the current
 * one. The pane on the right is the selected version against the one it
 * was edited from (the summary's own basis), or any other version picked.
 *
 * Publishing happens here, with the comparison on screen, so the review is
 * the history: Publish for a version newer than live, Roll back for an older
 * one (marker movement, no new version), and Edit from here to start a new
 * version from an earlier one. On a not-live scenario only the last exists.
 */
export function HistoryDrawer({
  open,
  onOpenChange,
  subject,
  initial,
  caseId,
  canEdit,
  editing,
  onPublish,
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
  /** Resolves false when publishing failed. */
  onPublish: (n: number) => Promise<boolean>
  onEditFrom: (n: number) => void
  /** DES-204: publishing a live item needs an approval, so the marker
   *  action becomes a request. */
  approval?: Approval
}) {
  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-5xl!">
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="flex flex-col gap-0.5">
            <DrawerTitle>Version history</DrawerTitle>
            <DrawerDescription>{subject.name}</DrawerDescription>
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
            onEditFrom={onEditFrom}
            onPublish={onPublish}
            subject={subject}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

type Load = "loading" | "failed" | "ready"

type Approval = {
  /** Who approves, in words — the client, or "A super admin". */
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
  onPublish,
  onEditFrom,
}: {
  approval?: Approval
  subject: Subject
  initial: { n: number; against: number | null }
  caseId: CaseId
  canEdit: boolean
  editing: number
  onPublish: (n: number) => Promise<boolean>
  onEditFrom: (n: number) => void
}) {
  const [load, setLoad] = React.useState<Load>("loading")
  const [attempt, setAttempt] = React.useState(0)
  const [only, setOnly] = React.useState<"all" | "mine">("all")
  const [selected, setSelected] = React.useState(initial.n)
  const [against, setAgainst] = React.useState<number | null>(initial.against)

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
              Nothing changed. The scenario and what callers hear are as they
              were.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => {
                setLoad("loading")
                setAttempt((count) => count + 1)
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

  const shown = subject.versions.filter(
    (version) => only === "all" || version.mine,
  )
  const version =
    subject.versions.find((item) => item.n === selected) ?? subject.versions[0]
  /* Against the version it was edited from — the summary's own basis — or,
     when that one is older than the list goes, the next one down. */
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
        <div className="border-b p-3">
          {/* A filter, so a chip like every other one — "All" is only the
              chip switched off, and needs no button of its own. */}
          <ToggleFilter
            field="Only mine"
            onChange={(on) => setOnly(on ? "mine" : "all")}
            value={only === "mine"}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <ol className="flex flex-col gap-1">
            {shown.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No versions of yours yet</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setOnly("all")} variant="outline">
                    Show all
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              shown.map((item, index) => (
                <VersionRow
                  key={item.n}
                  last={index === shown.length - 1}
                  live={subject.marker !== null}
                  marker={subject.marker}
                  onSelect={() => {
                    setSelected(item.n)
                    setAgainst(null)
                  }}
                  selected={item.n === version.n}
                  version={item}
                />
              ))
            )}
          </ol>
        </div>
      </aside>

      <VersionPane
        against={compare}
        approval={approval}
        canEdit={canEdit}
        editing={editing}
        key={version.n}
        onAgainst={setAgainst}
        onEditFrom={onEditFrom}
        onPublish={onPublish}
        subject={subject}
        version={version}
      />
    </div>
  )
}

/**
 * One version on the timeline. A rail runs down the list with a dot per
 * version, filled green on the one callers hear, so the reader sees at a
 * glance which saves sit above live and which below it. No box per row: the
 * selected one is a muted fill, as in a nav, and the summary is muted text
 * under the number rather than a paragraph competing with it.
 */
function VersionRow({
  version,
  marker,
  live,
  last,
  selected,
  onSelect,
}: {
  version: Version
  marker: number | null
  live: boolean
  /** The rail stops at the last dot. */
  last: boolean
  selected: boolean
  onSelect: () => void
}) {
  const isLive = version.n === marker
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
                isLive
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
              {isLive ? (
                <Badge
                  className="bg-success-tint text-success-tint-foreground"
                  variant="secondary"
                >
                  Live
                </Badge>
              ) : live && version.everLive ? (
                <Badge className="text-muted-foreground" variant="outline">
                  Was live
                </Badge>
              ) : null}
              <span className="ms-auto text-xs font-normal text-muted-foreground">
                {version.at}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {version.author}
            </span>
            <Summary
              className="line-clamp-2 text-muted-foreground"
              version={version}
            />
          </span>
        </button>
      </Item>
    </li>
  )
}

/** A version's summary, or where it is: still being written, or not made. */
function Summary({
  version,
  className,
}: {
  version: Version
  className?: string
}) {
  if (version.summary === null) {
    return (
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-3.5" />
        Writing summary
      </span>
    )
  }
  if (version.summary === "failed") {
    return (
      <span className="text-sm text-muted-foreground">
        No summary — compare to see the change
      </span>
    )
  }
  return <p className={cn("text-sm", className)}>{version.summary}</p>
}

function VersionPane({
  approval,
  subject,
  version,
  against,
  onAgainst,
  canEdit,
  editing,
  onPublish,
  onEditFrom,
}: {
  approval?: Approval
  subject: Subject
  version: Version
  against: Version | null
  onAgainst: (n: number) => void
  canEdit: boolean
  editing: number
  onPublish: (n: number) => Promise<boolean>
  onEditFrom: (n: number) => void
}) {
  const [publishing, setPublishing] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const marker = subject.marker
  const isLive = version.n === marker

  /* Publish moves the marker forward, Roll back moves it back. Neither
     makes a version (PRD). Absent on a not-live scenario, and on the live
     version itself. */
  const markerAction =
    marker === null || isLive || (approval && approval.pending !== null)
      ? null
      : approval
        ? "Request approval"
        : version.n > marker
          ? `Publish v${version.n}`
          : `Roll back to v${version.n}`

  const publish = async () => {
    if (approval) {
      approval.onRequest(version.n)
      return
    }
    setPublishing(true)
    setFailed(false)
    const ok = await onPublish(version.n)
    setPublishing(false)
    if (!ok) setFailed(true)
  }

  const [layout, setLayout] = React.useState<"split" | "unified">("split")
  const changed = subject.fields.filter(
    (field) => against && against.body[field.id] !== version.body[field.id],
  )
  const totals = changed.reduce(
    (sum, field) => {
      const stat = diffStat(against!.body[field.id], version.body[field.id])
      return {
        added: sum.added + stat.added,
        removed: sum.removed + stat.removed,
      }
    },
    { added: 0, removed: 0 },
  )

  /* What callers hear, and what this version would change about it — the
     line that used to be a sentence under the header. */
  const hearing =
    marker === null
      ? {
          label: "Runs",
          value: `v${subject.versions[0].n}`,
          sub: "The newest version, from the next call",
        }
      : {
          label: "Callers hear",
          value: `v${marker}`,
          sub: isLive
            ? "This version"
            : approval
              ? approval.pending !== null
                ? `v${approval.pending} is waiting for approval`
                : `v${version.n} once ${approval.by} approves`
              : version.n > marker
                ? `v${version.n} once you publish`
                : `v${version.n} on rollback, no new version`,
        }

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <OrbAvatar name={version.author} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="flex items-center gap-2 text-lg font-semibold tabular-nums">
              v{version.n}
              {isLive ? (
                <Badge
                  className="bg-success-tint text-success-tint-foreground"
                  variant="secondary"
                >
                  Live
                </Badge>
              ) : null}
            </h2>
            <p className="text-sm text-muted-foreground tabular-nums">
              {version.author} · {version.at}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {version.n === editing ? null : (
            <Permission allowed={canEdit}>
              <Button
                disabled={!canEdit || publishing}
                onClick={() => onEditFrom(version.n)}
                variant="outline"
              >
                <EditFromIcon />
                Edit from here
              </Button>
            </Permission>
          )}
          {markerAction ? (
            <Permission allowed={canEdit}>
              <Button disabled={!canEdit || publishing} onClick={publish}>
                {publishing ? <Spinner /> : null}
                {failed ? "Try again" : markerAction}
              </Button>
            </Permission>
          ) : null}
        </div>
      </div>

      {failed ? (
        <Alert className="bg-destructive-tint" variant="destructive">
          <AlertTitle>Couldn’t publish v{version.n}</AlertTitle>
          <AlertDescription>
            Callers still hear v{marker}. Nothing else changed.
          </AlertDescription>
        </Alert>
      ) : null}

      <dl className="grid grid-cols-3 divide-x rounded-lg border">
        <Fact label="Edited from">
          {version.editedFrom ? `v${version.editedFrom}` : "—"}
        </Fact>
        <Fact
          label={hearing.label}
          sub={hearing.sub}
          value={
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full",
                  marker === null ? "bg-muted-foreground/40" : "bg-success",
                )}
              />
              {hearing.value}
            </span>
          }
        />
        <Fact
          label="Changed"
          sub={
            against
              ? `${changed.length} of ${subject.fields.length} fields, against v${against.n}`
              : undefined
          }
          value={against ? <DiffStat {...totals} /> : "First version"}
        />
      </dl>

      {version.summary === null || version.summary === "failed" ? (
        <Summary version={version} />
      ) : (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm">
          {version.summary}
        </p>
      )}

      {against ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Changes from</span>
              <Select
                onValueChange={(value) => onAgainst(Number(value))}
                value={String(against.n)}
              >
                <SelectTrigger aria-label="Changes from" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {subject.versions
                    .filter((item) => item.n !== version.n)
                    .map((item) => (
                      <SelectItem key={item.n} value={String(item.n)}>
                        v{item.n}
                        {item.n === marker ? " · live" : ""}
                        {item.n === version.editedFrom ? " · edited from" : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {/* One setting with two states: a joined segmented control, a
                step down from the comparison it serves. */}
            <ToggleGroup
              aria-label="Diff layout"
              onValueChange={(value) => {
                if (value) setLayout(value as "split" | "unified")
              }}
              size="sm"
              spacing={0}
              type="single"
              value={layout}
              variant="outline"
            >
              <ToggleGroupItem value="split">Split</ToggleGroupItem>
              <ToggleGroupItem value="unified">Unified</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Every field gets a band, so an unchanged one still says so —
              the reader sees the whole scenario's shape, and only the
              changed ones open into a diff. */}
          {subject.fields.map((field) => {
            const before = against.body[field.id]
            const after = version.body[field.id]
            const same = before === after
            return (
              <div className="overflow-hidden rounded-lg border" key={field.id}>
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 bg-muted/60 px-3 py-2 text-xs font-medium",
                    !same && "border-b",
                  )}
                >
                  <span>{field.label}</span>
                  {same ? (
                    <span className="font-normal text-muted-foreground">
                      Unchanged
                    </span>
                  ) : (
                    <DiffStat {...diffStat(before, after)} />
                  )}
                </div>
                {same ? null : (
                  <FoldedDiff
                    after={after}
                    bare
                    before={before}
                    key={`${against.n}-${layout}`}
                    layout={layout}
                  />
                )}
              </div>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

/** One cell of the facts strip: a small label, the value, a muted line. */
function Fact({
  label,
  value,
  sub,
  children,
}: {
  label: string
  value?: React.ReactNode
  sub?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium tabular-nums">{value ?? children}</dd>
      {sub ? (
        <dd className="text-xs text-muted-foreground tabular-nums">{sub}</dd>
      ) : null}
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
