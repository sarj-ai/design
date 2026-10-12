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
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SideBySideDiff } from "@/components/shared/line-diff"
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

function HistoryBody({
  subject,
  initial,
  caseId,
  canEdit,
  editing,
  onPublish,
  onEditFrom,
}: {
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
    find(against) ??
    find(version.editedFrom) ??
    subject.versions.find((item) => item.n < version.n) ??
    null

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-80 shrink-0 flex-col border-e">
        <div className="border-b p-3">
          <ToggleGroup
            aria-label="Whose versions"
            onValueChange={(value) => {
              if (value) setOnly(value as "all" | "mine")
            }}
            size="sm"
            type="single"
            value={only}
            variant="outline"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="mine">Only mine</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
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
            shown.map((item) => (
              <VersionRow
                key={item.n}
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
        </div>
      </aside>

      <VersionPane
        against={compare}
        canEdit={canEdit}
        editing={editing}
        key={version.n}
        onAgainst={setAgainst}
        onEditFrom={onEditFrom}
        onPublish={onPublish}
        caseId={caseId}
        subject={subject}
        version={version}
      />
    </div>
  )
}

function VersionRow({
  version,
  marker,
  live,
  selected,
  onSelect,
}: {
  version: Version
  marker: number | null
  live: boolean
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Item
      asChild
      className={cn(
        "cursor-pointer text-start hover:bg-muted/50",
        selected && "border-primary ring-1 ring-primary",
      )}
      size="sm"
      variant="outline"
    >
      <button onClick={onSelect} type="button">
        <ItemContent className="min-w-0">
          <ItemTitle className="tabular-nums">
            v{version.n}
            {version.n === marker ? (
              <Badge
                className="bg-success-tint text-success-tint-foreground"
                variant="secondary"
              >
                Live
              </Badge>
            ) : live && version.everLive ? (
              <Badge
                className="bg-muted text-muted-foreground"
                variant="secondary"
              >
                Was live
              </Badge>
            ) : null}
          </ItemTitle>
          <ItemDescription className="tabular-nums">
            {version.author} · {version.at}
          </ItemDescription>
          <Summary className="line-clamp-2" version={version} />
        </ItemContent>
      </button>
    </Item>
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
  subject,
  version,
  against,
  onAgainst,
  caseId,
  canEdit,
  editing,
  onPublish,
  onEditFrom,
}: {
  subject: Subject
  version: Version
  against: Version | null
  onAgainst: (n: number) => void
  caseId: CaseId
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
    marker === null || isLive
      ? null
      : version.n > marker
        ? `Publish v${version.n}`
        : `Roll back to v${version.n}`

  const publish = async () => {
    setPublishing(true)
    setFailed(false)
    const ok = await onPublish(version.n)
    setPublishing(false)
    if (!ok) setFailed(true)
  }

  const changed = subject.fields.filter(
    (field) => against && against.body[field.id] !== version.body[field.id],
  )
  const unchanged = subject.fields.filter(
    (field) => against && against.body[field.id] === version.body[field.id],
  )

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="flex items-center gap-2 text-base font-medium tabular-nums">
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
            {version.editedFrom ? ` · edited from v${version.editedFrom}` : ""}
          </p>
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

      {markerAction && caseId !== "publish-fails" ? (
        <p className="text-sm text-muted-foreground">
          {version.n > (marker ?? 0)
            ? `Callers hear v${version.n} from the next call.`
            : `Callers go back to v${version.n} from the next call. No version is made, and v${marker} stays in history.`}
        </p>
      ) : null}

      <Summary version={version} />

      {against ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Compared with</span>
            <Select
              onValueChange={(value) => onAgainst(Number(value))}
              value={String(against.n)}
            >
              <SelectTrigger aria-label="Compared with" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {subject.versions
                  .filter((item) => item.n !== version.n)
                  .map((item) => (
                    <SelectItem key={item.n} value={String(item.n)}>
                      v{item.n}
                      {item.n === marker ? " (live)" : ""}
                      {item.n === version.editedFrom ? " (edited from)" : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {changed.map((field) => (
            <div className="flex flex-col gap-2" key={field.id}>
              <span className="text-sm font-medium">{field.label}</span>
              <div className="grid grid-cols-2 text-xs text-muted-foreground tabular-nums">
                <span className="px-3">v{against.n}</span>
                <span className="px-3">v{version.n}</span>
              </div>
              <SideBySideDiff
                after={version.body[field.id]}
                before={against.body[field.id]}
              />
            </div>
          ))}

          {changed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Same as v{against.n}.
            </p>
          ) : unchanged.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              No change: {unchanged.map((field) => field.label).join(", ")}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">The first version.</p>
      )}
    </section>
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
            className="h-20 w-full motion-reduce:animate-none"
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
