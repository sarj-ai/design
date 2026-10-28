"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  CALL_FLAGS,
  CALL_VERDICTS,
  COLLECTED,
  FLAG_LIMIT,
  INSIGHT_CATEGORY_LABELS,
  INSIGHTS,
  ISSUE_TYPE_LABELS,
  type IssueType,
  OUTCOME_LABELS,
  OUTCOMES,
  SUMMARY,
  TECHNICAL,
} from "@/lib/mockups/conversations-revamp-drawer-data"
import { formatTimeSeconds } from "@/components/mockups/conversations-revamp/drawer/recording-player"
import { Seekable } from "@/components/mockups/conversations-revamp/drawer/call-shell"
import {
  ChevronDownIcon,
  CollectedIcon,
  CompletedIcon,
  CustomizeIcon,
  DragHandleIcon,
  FailureIcon,
  FlagIcon,
  InsightsIcon,
  SummaryIcon,
  TechnicalIcon,
} from "@/components/mockups/conversations-revamp/drawer/icons"

export const ISSUE_TONE: Record<IssueType, string> = {
  connectivity: "bg-chart-2",
  flow: "bg-chart-3",
  latency: "bg-chart-5",
  other: "bg-chart-6",
  pronunciation: "bg-chart-1",
  silence: "bg-chart-4",
}

type SectionId =
  "collected" | "flags" | "insights" | "outcome" | "summary" | "technical"

type Arrangement = { id: SectionId; open: boolean; visible: boolean }

const STORAGE_KEY = "sarj-mockup:v4-panel-order"

const DEFAULT_ARRANGEMENT: Arrangement[] = [
  { id: "summary", open: true, visible: true },
  { id: "insights", open: true, visible: true },
  { id: "outcome", open: false, visible: true },
  { id: "collected", open: false, visible: true },
  { id: "flags", open: false, visible: true },
  { id: "technical", open: false, visible: false },
]

// Stored arrangement may predate added or renamed sections: keep known ids in
// stored order, then append missing defaults.
function normalise(stored: unknown): Arrangement[] {
  if (!Array.isArray(stored)) return DEFAULT_ARRANGEMENT

  const known = new Set(DEFAULT_ARRANGEMENT.map((item) => item.id))
  const kept: Arrangement[] = []

  for (const entry of stored) {
    const saved = entry as Arrangement | undefined
    const id = saved?.id
    if (!id || !known.has(id) || kept.some((item) => item.id === id)) continue
    kept.push({
      id,
      open: saved.open === true,
      visible: saved.visible !== false,
    })
  }

  for (const fallback of DEFAULT_ARRANGEMENT) {
    if (!kept.some((item) => item.id === fallback.id)) kept.push(fallback)
  }

  return kept
}

// Cached against the raw string: useSyncExternalStore compares snapshots by
// identity.
const listeners = new Set<() => void>()
let cachedRaw: string | null = null
let cachedValue = DEFAULT_ARRANGEMENT

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): Arrangement[] {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedValue = DEFAULT_ARRANGEMENT

    if (raw) {
      try {
        cachedValue = normalise(JSON.parse(raw))
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
        cachedRaw = null
      }
    }
  }

  return cachedValue
}

function getServerSnapshot(): Arrangement[] {
  return DEFAULT_ARRANGEMENT
}

function store(next: Arrangement[] | null) {
  if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  else window.localStorage.removeItem(STORAGE_KEY)

  for (const listener of listeners) listener()
}

export function SectionRegister({
  onSeek,
}: {
  onSeek: (seconds: number) => void
}) {
  const arrangement = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )
  const anchors = React.useRef<Record<string, HTMLDivElement | null>>({})

  function setOpen(id: SectionId, open: boolean) {
    store(
      arrangement.map((item) => (item.id === id ? { ...item, open } : item)),
    )
  }

  function jumpTo(id: SectionId) {
    setOpen(id, true)
    anchors.current[id]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    })
  }

  const sections = useSections(onSeek)
  const shown = arrangement.filter((item) => item.visible)

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 items-start gap-2 border-b pb-3">
        <div className="flex flex-1 flex-wrap items-center gap-1">
          {shown.map((item) => (
            <Button
              className="font-normal"
              key={item.id}
              onClick={() => {
                jumpTo(item.id)
              }}
              size="xs"
              variant="ghost"
            >
              {sections[item.id].title}
            </Button>
          ))}
        </div>

        <CustomizePopover
          arrangement={arrangement}
          onRearrange={(next) => {
            store(next)
          }}
          onReset={() => {
            store(null)
          }}
          sections={sections}
        />
      </div>

      <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-1">
        {shown.map((item) => {
          const section = sections[item.id]

          return (
            <PanelSection
              icon={section.icon}
              isOpen={item.open}
              key={item.id}
              onToggle={() => {
                setOpen(item.id, !item.open)
              }}
              ref={(node) => {
                anchors.current[item.id] = node
              }}
              summary={section.summary}
              title={section.title}
            >
              {section.body}
            </PanelSection>
          )
        })}
      </div>
    </div>
  )
}

function CustomizePopover({
  arrangement,
  onRearrange,
  onReset,
  sections,
}: {
  arrangement: Arrangement[]
  onRearrange: (next: Arrangement[]) => void
  onReset: () => void
  sections: Record<SectionId, Section>
}) {
  const [dragging, setDragging] = React.useState<SectionId | null>(null)
  const [dropAt, setDropAt] = React.useState<number | null>(null)

  function move(from: number, to: number) {
    if (to < 0 || to >= arrangement.length || from === to) return
    const next = [...arrangement]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onRearrange(next)
  }

  // Drop uses an insertion point, which shifts once the row is lifted out.
  function moveTo(from: number, insertAt: number) {
    const next = [...arrangement]
    const [moved] = next.splice(from, 1)
    next.splice(insertAt > from ? insertAt - 1 : insertAt, 0, moved)
    onRearrange(next)
  }

  function set(id: SectionId, patch: Partial<Arrangement>) {
    onRearrange(
      arrangement.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    )
  }

  function endDrag() {
    setDragging(null)
    setDropAt(null)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Customize panel"
          className="shrink-0"
          size="icon-xs"
          variant="ghost"
        >
          <CustomizeIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="flex w-80 flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            Customize panel
          </span>
          <span className="text-xs text-muted-foreground">
            Drag a section to reorder it. The switch takes it off the panel
            entirely.
          </span>
        </div>

        <div className="flex flex-col">
          {arrangement.map((item, index) => (
            <div
              className={cn(
                "relative flex items-center gap-2 rounded-lg py-1.5 pe-1 transition-opacity duration-150 ease-out-cubic motion-reduce:transition-none",
                dragging === item.id && "opacity-40",
              )}
              draggable
              key={item.id}
              onDragEnd={endDrag}
              onDragOver={(event) => {
                event.preventDefault()
                const box = event.currentTarget.getBoundingClientRect()
                const below = event.clientY > box.top + box.height / 2
                setDropAt(below ? index + 1 : index)
              }}
              onDragStart={() => {
                setDragging(item.id)
              }}
              onDrop={() => {
                const from = arrangement.findIndex(
                  (entry) => entry.id === dragging,
                )
                if (from !== -1 && dropAt !== null) moveTo(from, dropAt)
                endDrag()
              }}
            >
              {dropAt === index ? <DropLine className="-top-px" /> : null}
              {dropAt === arrangement.length &&
              index === arrangement.length - 1 ? (
                <DropLine className="-bottom-px" />
              ) : null}

              <Button
                aria-label={`Reorder ${sections[item.id].title}`}
                className="shrink-0 cursor-grab"
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault()
                    move(index, index - 1)
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault()
                    move(index, index + 1)
                  }
                }}
                size="icon-xs"
                variant="ghost"
              >
                <DragHandleIcon />
              </Button>

              <span className="truncate text-sm text-foreground">
                {sections[item.id].title}
              </span>

              <span className="ms-auto flex justify-center">
                <Switch
                  aria-label={`Show ${sections[item.id].title}`}
                  checked={item.visible}
                  onCheckedChange={(checked) => {
                    set(item.id, {
                      open: checked ? item.open : false,
                      visible: checked,
                    })
                  }}
                />
              </span>
            </div>
          ))}
        </div>

        <Button
          className="self-end"
          onClick={onReset}
          size="sm"
          variant="ghost"
        >
          Reset
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function DropLine({ className }: { className: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-x-0 h-0.5 rounded-sm bg-primary",
        className,
      )}
    />
  )
}

type Section = {
  body: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  summary: string
  title: string
}

function PanelSection({
  children,
  icon: Icon,
  isOpen,
  onToggle,
  ref,
  summary,
  title,
}: {
  children: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  isOpen: boolean
  onToggle: () => void
  ref: (node: HTMLDivElement | null) => void
  summary: string
  title: string
}) {
  return (
    <div className="flex scroll-mt-1 flex-col rounded-lg bg-muted" ref={ref}>
      <Button
        aria-expanded={isOpen}
        className="justify-start font-normal"
        onClick={onToggle}
        variant="ghost"
      >
        <Icon className="size-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{title}</span>
        <span className="ms-auto text-xs text-muted-foreground">{summary}</span>
        <ChevronDownIcon
          className={cn(
            "transition-transform duration-200 ease-out-cubic motion-reduce:transition-none",
            isOpen && "rotate-180",
          )}
        />
      </Button>

      {isOpen ? (
        <div className="flex flex-col gap-3 px-3 pb-3">{children}</div>
      ) : null}
    </div>
  )
}

function useSections(onSeek: (seconds: number) => void) {
  const registry: Record<SectionId, Section> = {
    collected: {
      body: <CollectedBody />,
      icon: CollectedIcon,
      summary: `${COLLECTED.length} fields`,
      title: "Collected data",
    },
    flags: {
      body: <FlagsBody onSeek={onSeek} />,
      icon: FlagIcon,
      summary: `${CALL_FLAGS.length} of ${FLAG_LIMIT}`,
      title: "Flags",
    },
    insights: {
      body: <InsightsBody />,
      icon: InsightsIcon,
      summary: `${INSIGHTS.length} insights`,
      title: "Insights",
    },
    outcome: {
      body: <OutcomeBody />,
      icon: CompletedIcon,
      summary: OUTCOME_LABELS[OUTCOMES[0].status],
      title: "Call outcome",
    },
    summary: {
      body: <SummaryBody />,
      icon: SummaryIcon,
      summary: SUMMARY.generatedAt,
      title: "Summary",
    },
    technical: {
      body: <TechnicalBody />,
      icon: TechnicalIcon,
      summary: `${TECHNICAL.length} rows`,
      title: "Technical",
    },
  }

  return registry
}

function SummaryBody() {
  return (
    <p className="text-sm leading-relaxed text-foreground">{SUMMARY.text}</p>
  )
}

function InsightsBody() {
  return (
    <div className="flex flex-col gap-4">
      {INSIGHTS.map((insight) => (
        <div className="flex flex-col gap-1" key={insight.id}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              {insight.title}
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="shrink-0" variant="outline">
                  {insight.category}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                {INSIGHT_CATEGORY_LABELS[insight.category]}
              </TooltipContent>
            </Tooltip>
          </div>

          <p className="text-sm text-muted-foreground">{insight.description}</p>
        </div>
      ))}
    </div>
  )
}

function OutcomeBody() {
  const outcome = OUTCOMES[0]

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {CALL_VERDICTS.map((verdict) => (
          <div className="flex flex-col gap-1" key={verdict.label}>
            <span className="text-xs text-muted-foreground">
              {verdict.label}
            </span>
            <Badge
              className={
                verdict.ok
                  ? "bg-success-tint text-success-tint-foreground"
                  : "bg-destructive-tint text-destructive-tint-foreground"
              }
              variant="secondary"
            >
              {verdict.ok ? <CompletedIcon /> : <FailureIcon />}
              {verdict.value}
            </Badge>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">Reason</span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {outcome.reason}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            Success criteria
          </span>
          <span className="text-xs text-muted-foreground">
            {outcome.criteria.filter((item) => item.achieved).length} of{" "}
            {outcome.criteria.length} achieved
          </span>
        </div>

        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {outcome.criteria.map((criterion) => (
            <div
              className="flex items-start gap-2 rounded-lg bg-card p-3"
              key={criterion.text}
            >
              {criterion.achieved ? (
                <CompletedIcon className="mt-0.5 size-4 shrink-0 text-success" />
              ) : (
                <FailureIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
              )}

              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm text-foreground">
                  {criterion.text}
                </span>
                <span className="text-xs text-muted-foreground">
                  {criterion.achieved ? "Achieved" : "Not achieved"}
                </span>
              </span>

              {criterion.isPrimary ? (
                <Badge className="ms-auto shrink-0" variant="outline">
                  Primary
                </Badge>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function FlagsBody({ onSeek }: { onSeek: (seconds: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      {CALL_FLAGS.map((flag) => {
        const seconds = Math.round(flag.timestampMs / 1000)

        return (
          <Seekable
            className="flex items-start gap-2 rounded-lg px-2 py-2 transition-colors duration-150 ease-out-cubic hover:bg-accent motion-reduce:transition-none"
            key={flag.id}
            label={`Seek to ${formatTimeSeconds(seconds)}`}
            onActivate={() => {
              onSeek(seconds)
            }}
          >
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-4xl",
                ISSUE_TONE[flag.issueType],
              )}
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2 text-sm text-foreground">
                {ISSUE_TYPE_LABELS[flag.issueType]}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatTimeSeconds(seconds)}
                </span>
              </span>
              {flag.comment ? (
                <span className="text-xs text-muted-foreground">
                  {flag.comment}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">{flag.user}</span>
            </span>
          </Seekable>
        )
      })}
    </div>
  )
}

function CollectedBody() {
  return (
    <div className="flex flex-col gap-2">
      {COLLECTED.map((field) => (
        <div
          className="flex items-baseline justify-between gap-4"
          key={field.label}
        >
          <span className="text-xs text-muted-foreground">{field.label}</span>
          <span className="text-sm font-medium text-foreground">
            {field.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function TechnicalBody() {
  return (
    <div className="flex flex-col gap-2">
      {TECHNICAL.map((row) => (
        <div
          className="flex items-baseline justify-between gap-4"
          key={row.label}
        >
          <span className="text-xs text-muted-foreground">{row.label}</span>
          <span className="text-xs text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  )
}
