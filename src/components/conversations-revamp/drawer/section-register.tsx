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
} from "@/lib/conversations-revamp-drawer-data"
import { formatTimeSeconds } from "@/components/conversations-revamp/drawer/recording-player"
import { Seekable } from "@/components/conversations-revamp/drawer/call-shell"
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
} from "@/components/conversations-revamp/drawer/icons"

/**
 * The panel, as a register the reader owns rather than a stack we chose for
 * them.
 *
 * Two things drive this. Sections keep arriving — every PRD adds one — and the
 * order that suits a collections reviewer is not the order that suits someone
 * auditing transcription quality. So order and visibility are settings, they
 * are stored, and a section that is shut still states its finding in its own
 * header, which is what makes collapsing safe rather than hostile.
 */

/**
 * Which chart slot each issue type gets. Six unrelated kinds of problem, which
 * is what the DES-174 palette is for — on the purple ramp this replaced, a
 * silence issue and a latency issue were two shades of the same thing.
 */
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

/**
 * `open` is stored alongside order and visibility on purpose. Collapsing a
 * section in the panel and setting it to start collapsed are the same wish, so
 * they are the same flag — whichever way you set it, the section stays that way
 * on the next call.
 */
type Arrangement = { id: SectionId; open: boolean; visible: boolean }

const STORAGE_KEY = "sarj-mockup:v4-panel-order"

/**
 * Summary and Insights answer "what happened on this call", so they start open.
 * Technical is hidden outright — it is the rail nobody read.
 */
const DEFAULT_ARRANGEMENT: Arrangement[] = [
  { id: "summary", open: true, visible: true },
  { id: "insights", open: true, visible: true },
  { id: "outcome", open: false, visible: true },
  { id: "collected", open: false, visible: true },
  { id: "flags", open: false, visible: true },
  { id: "technical", open: false, visible: false },
]

/**
 * A stored arrangement is not trusted: it can predate a section being added or
 * renamed. Keep what is still known, in the stored order, then append anything
 * the defaults have that it does not.
 */
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

/* ---------------------------------------------------------- stored setting */

/**
 * The arrangement is state that lives outside React — localStorage owns it, and
 * it has to survive the drawer being closed and reopened, which unmounts every
 * component below. So it is read through `useSyncExternalStore` rather than
 * copied into state on mount: the server renders the defaults, the client
 * renders what is stored, and neither needs an effect to reconcile them.
 *
 * `snapshot` is cached against the raw string because the hook compares
 * snapshots by identity — parsing afresh on every call would never settle.
 */
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
      {/* The chips wrap in their own box so the Customize button stays pinned
          beside them instead of being pushed onto a line of its own. */}
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

/* ------------------------------------------------------------- customizing */

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
  /** Where the dragged row would land — the index the drop line sits before. */
  const [dropAt, setDropAt] = React.useState<number | null>(null)

  function move(from: number, to: number) {
    if (to < 0 || to >= arrangement.length || from === to) return
    const next = [...arrangement]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onRearrange(next)
  }

  /** Drop uses an insertion point, which shifts once the row is lifted out. */
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
                // Past the midpoint means it lands after this row, not before.
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
              {/* The drop line is absolutely positioned so showing it does not
                  shove the rows around while you are still dragging. */}
              {dropAt === index ? <DropLine className="-top-px" /> : null}
              {dropAt === arrangement.length &&
              index === arrangement.length - 1 ? (
                <DropLine className="-bottom-px" />
              ) : null}

              {/* A button, not just the icon: dragging is the way to reorder
                  now that the arrows are gone, and dragging has no keyboard
                  equivalent — so the handle takes arrow keys itself. */}
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

              {/* Show only. "Open by default" was a second switch answering a
                  question the panel already answers by itself — collapsing a
                  section in the panel is stored, so the state it is in is the
                  state it starts in next time. */}
              <span className="ms-auto flex justify-center">
                <Switch
                  aria-label={`Show ${sections[item.id].title}`}
                  checked={item.visible}
                  onCheckedChange={(checked) => {
                    // Hiding a section also closes it, so bringing it back does
                    // not dump an expanded body into the panel unannounced.
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

/** Where the dragged row will land. */
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

/* ---------------------------------------------------------------- sections */

type Section = {
  body: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  /** What the header says while the section is shut. */
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
      /* The label, not the raw value — the collapsed header is the one place
         the reader sees the verdict without opening the section. */
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

/**
 * Insights, as they actually are.
 *
 * The earlier revamps drew this as an outcome with a failure badge and a
 * criteria checklist. It is neither. An insight has a title, a description, and
 * one of four categories naming which part of the agent has to change — and no
 * status at all. Success and failure belong to the call outcome above.
 */
function InsightsBody() {
  return (
    <div className="flex flex-col gap-4">
      {INSIGHTS.map((insight) => (
        <div className="flex flex-col gap-1" key={insight.id}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              {insight.title}
            </span>

            {/* One neutral treatment for all four. A category is not a
                severity, so it must not be coloured into looking like one —
                outline reads as a chip without implying good or bad. */}
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

/**
 * Three verdicts, then why, then what was checked.
 *
 * The three are separate questions and used to be one badge: a call can
 * connect and still miss its goal, and an agent can behave well on a call whose
 * goal was never reachable. Collapsing them hid exactly the case worth finding.
 *
 * The criteria list is capped and scrolls. A scenario can carry a dozen, and a
 * section that grows without limit pushes everything under it off the panel —
 * which is how the sections a reader ordered stop being where they put them.
 */
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
            /* bg-card, not bg-muted: the section itself is already the muted
               surface, so a row has to come forward to read as a row. */
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
