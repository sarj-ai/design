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
import { cn } from "@/lib/utils"
import {
  OWNER,
  SENTIMENT_LABELS,
  type CallRow,
} from "@/lib/behavioral-alerts-data"
import {
  AlertDetectionsBody,
  detectionsSummary,
} from "@/components/behavioral-alerts/alert-detections"
import {
  FlagsIcon,
  CollectedIcon,
  CriterionMetIcon,
  CriterionMissedIcon,
  CustomizeIcon,
  DragHandleIcon,
  ExperienceIcon,
  GeneratedAtIcon,
  SectionToggleIcon,
  TechnicalIcon,
} from "@/components/behavioral-alerts/icons"
import { UserExperienceBody } from "@/components/behavioral-alerts/user-experience"

/**
 * The panel, as the revamped drawer has it: a register the reader owns rather
 * than a stack we chose for them.
 *
 * Sections keep arriving — this PRD adds two of them — and the order that suits
 * someone triaging frustrated callers is not the order that suits someone
 * auditing whether the workflow completed. So order and visibility are
 * settings, they are stored, and a section that is shut still states its
 * finding in its own header, which is what makes collapsing safe rather than
 * hostile.
 */

type SectionId = "alerts" | "collected" | "experience" | "outcome" | "technical"

/**
 * `open` is stored alongside order and visibility on purpose. Collapsing a
 * section in the panel and setting it to start collapsed are the same wish, so
 * they are the same flag — whichever way you set it, the section stays that way
 * on the next call.
 */
type Arrangement = { id: SectionId; open: boolean; visible: boolean }

const STORAGE_KEY = "sarj-mockup:behavioral-alerts-panel"

/**
 * The two the PRD adds lead, because they are the reading a client currently
 * cannot get anywhere. Technical is hidden outright — it is the rail nobody
 * read, and the header already prints the four fields off it that get used.
 */
const DEFAULT_ARRANGEMENT: Arrangement[] = [
  { id: "experience", open: true, visible: true },
  { id: "alerts", open: true, visible: true },
  { id: "outcome", open: false, visible: true },
  { id: "collected", open: false, visible: true },
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

/* ----------------------------------------------------------- the register */

export function SectionRegister({
  call,
  onConfigureAlerts,
  onSeek,
}: {
  call: CallRow
  onConfigureAlerts: () => void
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

  const sections = useSections(call, onConfigureAlerts, onSeek)
  /**
   * A section with nothing behind it on this call is absent, not empty: an
   * unanalysed call has no user experience to report, and a scenario that
   * extracts nothing has no collected data. A header that only ever says
   * "none" is a row the reader learns to skip.
   */
  const present = arrangement.filter((item) => sections[item.id] !== null)
  const shown = present.filter((item) => item.visible)

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
              {sections[item.id]?.title}
            </Button>
          ))}
        </div>

        <CustomizePopover
          arrangement={present}
          onRearrange={(next) => {
            // Only the sections on this call are draggable, so the ones that
            // are absent keep their stored place rather than being appended.
            const order = next.map((item) => item.id)
            let cursor = 0
            store(
              arrangement.map((item) =>
                order.includes(item.id) ? next[cursor++] : item,
              ),
            )
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
          if (!section) return null

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
  sections: Record<SectionId, null | Section>
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

              {/* A button, not just the icon: dragging is the way to reorder,
                  and dragging has no keyboard equivalent — so the handle takes
                  arrow keys itself. */}
              <Button
                aria-label={`Reorder ${sections[item.id]?.title ?? item.id}`}
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
                {sections[item.id]?.title}
              </span>

              {/* Show only. "Open by default" was a second switch answering a
                  question the panel already answers by itself — collapsing a
                  section in the panel is stored, so the state it is in is the
                  state it starts in next time. */}
              <span className="ms-auto flex justify-center">
                <Switch
                  aria-label={`Show ${sections[item.id]?.title ?? item.id}`}
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
        <SectionToggleIcon
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

/** `null` means this call has nothing for that section, so it is not drawn. */
function useSections(
  call: CallRow,
  onConfigureAlerts: () => void,
  onSeek: (seconds: number) => void,
): Record<SectionId, null | Section> {
  const journey = call.analysis.journey

  return {
    alerts: {
      body: (
        <AlertDetectionsBody
          analysis={call.analysis}
          onConfigureAlerts={onConfigureAlerts}
          onSeek={onSeek}
        />
      ),
      icon: FlagsIcon,
      summary: detectionsSummary(call.analysis),
      title: "Call flags",
    },
    collected: call.collected.length
      ? {
          body: <CollectedBody call={call} />,
          icon: CollectedIcon,
          summary: `${call.collected.length} fields`,
          title: "Collected data",
        }
      : null,
    experience: journey
      ? {
          body: <UserExperienceBody journey={journey} />,
          icon: ExperienceIcon,
          /* Sentiment and the rating together, because either one alone reads
             as the whole verdict — a five-star neutral call and a two-star
             neutral call are not the same call. */
          summary: `${SENTIMENT_LABELS[journey.sentiment]} · ${journey.rating}/5`,
          title: "Caller experience",
        }
      : null,
    outcome: {
      body: <OutcomeBody call={call} />,
      icon:
        call.outcome.status === "success"
          ? CriterionMetIcon
          : CriterionMissedIcon,
      /* The verdict, not the raw value — the collapsed header is the one place
         the reader sees it without opening the section. */
      summary: call.outcome.status === "success" ? "Achieved" : "Not achieved",
      title: "Call outcome",
    },
    technical: {
      body: <TechnicalBody call={call} />,
      icon: TechnicalIcon,
      summary: `${call.callId.slice(0, 8)}…`,
      title: "Technical",
    },
  }
}

/**
 * The scenario's own pass/fail and why — the reading the platform gives today,
 * kept beside the one this PRD adds rather than replaced by it.
 */
function OutcomeBody({ call }: { call: CallRow }) {
  const achieved = call.outcome.criteria.filter((item) => item.achieved).length

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Reason</span>
        <p className="text-sm leading-relaxed text-foreground">
          {call.outcome.reason}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <GeneratedAtIcon className="size-3.5" />
        Generated {call.endedAt}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            Success criteria
          </span>
          <span className="text-xs text-muted-foreground">
            {achieved} of {call.outcome.criteria.length} achieved
          </span>
        </div>

        {call.outcome.criteria.map((criterion) => (
          /* bg-card, not bg-muted: the section itself is already the muted
             surface, so a row has to come forward to read as a row. */
          <div
            className="flex items-start gap-2 rounded-lg bg-card p-3"
            key={criterion.text}
          >
            {criterion.achieved ? (
              <CriterionMetIcon className="mt-0.5 size-4 shrink-0 text-success" />
            ) : (
              <CriterionMissedIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
            )}

            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm text-foreground">{criterion.text}</span>
              <span className="text-xs text-muted-foreground">
                {criterion.achieved ? "Achieved" : "Not achieved"}
              </span>
            </span>

            {criterion.primary ? (
              <Badge className="ms-auto shrink-0" variant="outline">
                Primary
              </Badge>
            ) : null}
          </div>
        ))}
      </div>
    </>
  )
}

function CollectedBody({ call }: { call: CallRow }) {
  return (
    <div className="flex flex-col gap-2">
      {call.collected.map((field) => (
        <div
          className="flex items-baseline justify-between gap-4"
          key={field.label}
        >
          <span className="font-mono text-xs text-muted-foreground">
            {field.label}
          </span>
          <span className="text-sm font-medium text-foreground">
            {field.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function TechnicalBody({ call }: { call: CallRow }) {
  const rows = [
    { label: "Call ID", value: call.callId },
    { label: "Created", value: call.createdAt },
    { label: "Started", value: call.startedAt },
    { label: "Ended", value: call.endedAt },
    { label: "User", value: OWNER.userId },
    { label: "Organization", value: OWNER.organizationId },
  ]

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div
          className="flex items-baseline justify-between gap-4"
          key={row.label}
        >
          <span className="text-xs text-muted-foreground">{row.label}</span>
          <span className="truncate text-xs text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  )
}
