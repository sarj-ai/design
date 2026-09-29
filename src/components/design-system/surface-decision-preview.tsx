"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Item, ItemContent, ItemGroup } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar"
import { ListFooter } from "@/components/shared/list-footer"
import {
  CloseIcon,
  NextRecordIcon,
  PreviousRecordIcon,
  SearchIcon,
} from "@/components/design-system/icons"
import {
  SurfaceDemo,
  useRecordKeys,
} from "@/components/design-system/surface-demos"
import { SurfaceDiagram } from "@/components/design-system/surface-diagram"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import { cn } from "@/lib/utils"
import {
  SURFACE_CHOICES,
  SURFACE_RULES,
  type SurfaceId,
  type SurfaceRuleId,
} from "@/lib/design-system/data"
import {
  SURFACE_AUDIT,
  VERDICT_LABEL,
  type AuditRow,
  type Verdict,
} from "@/lib/design-system/surface-audit"

/**
 * Choosing a surface: the decision, the rules every surface keeps, and the
 * rules dry-run against every overlay in the Sarj platform.
 *
 * Three tabs rather than one long page because they are read for different
 * reasons. Decide is for the person building a screen: answer what the reader
 * is doing and it names the surface, its shape and a working one. Rules is
 * what holds whichever surface that was. Dry run is the evidence — 115 real
 * overlays, each with what the decision would change — and every rule links
 * into it, so "Sarj breaks this 27 times" is one click from the 27.
 */

const TABS = [
  { id: "decide", label: "Decide" },
  { id: "rules", label: "Rules" },
  { id: "dry-run", label: "Dry run" },
]

/* -------------------------------------------------------------------------
 * The decision
 * ---------------------------------------------------------------------- */

type Task = "configuring" | "creating" | "picking" | "reading" | "confirming"

const TASKS: { id: Task; label: string }[] = [
  { id: "configuring", label: "Configuring" },
  { id: "creating", label: "Creating" },
  { id: "picking", label: "Picking" },
  { id: "reading", label: "Reading a record" },
  { id: "confirming", label: "Confirming" },
]

type Answer = { id: string; label: string; surface: SurfaceId }

/**
 * The second question, where the first does not settle it. Configuring and
 * creating ask the same thing — how much is there — because size is what
 * separates a dialog from a drawer from a page; Carbon's line of four fields
 * is the only number any system commits to, and ElevenLabs keeps to it.
 */
const FOLLOW_UP: Partial<
  Record<Task, { question: string; answers: Answer[] }>
> = {
  configuring: {
    question: "How much of it?",
    answers: [
      { id: "one", label: "One value", surface: "inline" },
      { id: "few", label: "Up to four fields", surface: "dialog" },
      { id: "more", label: "More, or it grows", surface: "drawer" },
      { id: "whole", label: "The whole object", surface: "page" },
    ],
  },
  creating: {
    question: "How big is it?",
    answers: [
      { id: "few", label: "Up to four fields", surface: "dialog" },
      { id: "more", label: "More, or it grows", surface: "drawer" },
      { id: "steps", label: "Several steps", surface: "page" },
    ],
  },
  confirming: {
    question: "Can it be undone?",
    answers: [
      { id: "yes", label: "Yes", surface: "undo" },
      {
        id: "no",
        label: "No, or it takes something live down",
        surface: "confirm",
      },
    ],
  },
}

const DIRECT: Partial<Record<Task, SurfaceId>> = {
  picking: "popover",
  reading: "record",
}

/** The answers that lead to each surface, for when a tile is picked. */
const LEADS_TO: Record<SurfaceId, { task: Task; answer?: string }> = {
  inline: { task: "configuring", answer: "one" },
  popover: { task: "picking" },
  undo: { task: "confirming", answer: "yes" },
  dialog: { task: "creating", answer: "few" },
  confirm: { task: "confirming", answer: "no" },
  drawer: { task: "configuring", answer: "more" },
  record: { task: "reading" },
  page: { task: "creating", answer: "steps" },
}

/* -------------------------------------------------------------------------
 * The dry run's filters, lifted here so a rule or a surface can open it
 * already narrowed.
 * ---------------------------------------------------------------------- */

type AuditFilters = {
  query: string
  areas: string[]
  verdicts: string[]
  today: string[]
  should: string[]
  breaks: string[]
}

const NO_FILTERS: AuditFilters = {
  query: "",
  areas: [],
  verdicts: [],
  today: [],
  should: [],
  breaks: [],
}

const SURFACE_TITLE = Object.fromEntries(
  SURFACE_CHOICES.map((choice) => [choice.id, choice.title]),
) as Record<SurfaceId, string>

const RULE_LABEL = Object.fromEntries(
  SURFACE_RULES.map((rule) => [rule.id, rule.label]),
) as Record<SurfaceRuleId, string>

function breaking(rule: SurfaceRuleId) {
  return SURFACE_AUDIT.filter((row) => row.breaks.includes(rule)).length
}

export function SurfaceDecisionPreview() {
  const [tab, setTab] = React.useState("decide")
  const [filters, setFilters] = React.useState<AuditFilters>(NO_FILTERS)

  const openDryRun = (patch: Partial<AuditFilters>) => {
    setFilters({ ...NO_FILTERS, ...patch })
    setTab("dry-run")
  }

  return (
    <SecondaryTabs items={TABS} onValueChange={setTab} value={tab}>
      <TabsContent value="decide">
        <Decide onShowRows={(surface) => openDryRun({ should: [surface] })} />
      </TabsContent>
      <TabsContent value="rules">
        <Rules onShowRows={(rule) => openDryRun({ breaks: [rule] })} />
      </TabsContent>
      <TabsContent value="dry-run">
        <DryRun filters={filters} onFiltersChange={setFilters} />
      </TabsContent>
    </SecondaryTabs>
  )
}

function Decide({ onShowRows }: { onShowRows: (surface: SurfaceId) => void }) {
  const [task, setTask] = React.useState<Task>("configuring")
  const [answers, setAnswers] = React.useState<Partial<Record<Task, string>>>({
    configuring: "more",
    creating: "steps",
    confirming: "no",
  })

  const followUp = FOLLOW_UP[task]
  const surface: SurfaceId =
    DIRECT[task] ??
    followUp?.answers.find((entry) => entry.id === answers[task])?.surface ??
    "drawer"
  const choice = SURFACE_CHOICES.find((entry) => entry.id === surface)!
  const sentHere = SURFACE_AUDIT.filter((row) => row.should === surface).length

  return (
    <div className="flex flex-col gap-4">
      {/* The question. */}
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
            <Question label="What is the reader doing?">
              <ToggleGroup
                onValueChange={(value) => value && setTask(value as Task)}
                type="single"
                value={task}
                variant="outline"
              >
                {TASKS.map((entry) => (
                  <ToggleGroupItem key={entry.id} value={entry.id}>
                    {entry.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Question>

            {/* Absent, not disabled, when the first answer settles it. */}
            {followUp ? (
              <Question label={followUp.question}>
                <ToggleGroup
                  onValueChange={(value) =>
                    value &&
                    setAnswers((current) => ({ ...current, [task]: value }))
                  }
                  type="single"
                  value={answers[task]}
                  variant="outline"
                >
                  {followUp.answers.map((entry) => (
                    <ToggleGroupItem key={entry.id} value={entry.id}>
                      {entry.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Question>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {SURFACE_CHOICES.map((entry) => {
              const selected = entry.id === surface
              return (
                <Item
                  asChild
                  className={cn(
                    "flex-col items-stretch gap-3 p-3 text-start transition-colors duration-150 ease-out-cubic motion-reduce:transition-none",
                    selected
                      ? "border-primary ring-1 ring-primary"
                      : "hover:bg-muted/50",
                  )}
                  key={entry.id}
                  variant="outline"
                >
                  <button
                    aria-pressed={selected}
                    onClick={() => {
                      const lead = LEADS_TO[entry.id]
                      setTask(lead.task)
                      if (lead.answer) {
                        setAnswers((current) => ({
                          ...current,
                          [lead.task]: lead.answer,
                        }))
                      }
                    }}
                    type="button"
                  >
                    <SurfaceDiagram variant={entry.id} />
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium">{entry.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {entry.sits}
                      </span>
                    </span>
                  </button>
                </Item>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* The answer: what it is, what it is for, its shape, and one to try.
          Keyed by surface so the demo inside starts fresh on every change. */}
      <Card key={choice.id}>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <h3 className="text-lg font-medium">{choice.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {choice.sits} · {choice.size}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Seen in {choice.seenIn}
              </p>
            </div>
            {sentHere ? (
              <Button
                onClick={() => onShowRows(surface)}
                size="sm"
                variant="outline"
              >
                {sentHere} platform overlays belong here
              </Button>
            ) : null}
          </div>

          <dl className="grid gap-6 text-sm md:grid-cols-3">
            <Row term="Reach for it when">{choice.criterion}</Row>
            <Row term="Never for">
              {choice.avoid.charAt(0).toUpperCase() + choice.avoid.slice(1)}
            </Row>
            <Row term="In Sarj">{choice.examples}</Row>
          </dl>

          <dl className="text-sm">
            <Row term="Its shape">
              <ul className="grid gap-x-6 gap-y-1.5 md:grid-cols-2">
                {choice.shape.map((line) => (
                  <li className="flex gap-2" key={line}>
                    <span
                      aria-hidden
                      className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </Row>
          </dl>

          {/* The stage. A page takes the whole width, because the whole
              screen is the point; everything else is tried at the size a
              panel would give it. */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Try it
            </span>
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-xl bg-muted/50",
                choice.id === "page" ? "p-4" : "min-h-56 p-6",
              )}
            >
              <div
                className={cn(
                  "flex w-full flex-col",
                  choice.id !== "page" && "max-w-md",
                )}
              >
                <SurfaceDemo variant={choice.id} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Question({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  )
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{term}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  )
}

/* -------------------------------------------------------------------------
 * The rules
 * ---------------------------------------------------------------------- */

/* Grouped by when they bite: on every overlay, when one asks before
   acting, and in the two places a list is involved. Numbered straight
   through, so "rule 7" means one thing wherever it is quoted. */
const RULE_GROUPS: { label: string; rules: SurfaceRuleId[] }[] = [
  {
    label: "Every overlay",
    rules: ["one-at-a-time", "pinned", "widths", "guard", "footer", "feedback"],
  },
  {
    label: "Asking before acting",
    rules: ["undo-first", "confirm-copy", "red", "typed"],
  },
  { label: "Lists", rules: ["record-url", "picker"] },
]

const RULE_ORDER = RULE_GROUPS.flatMap((group) => group.rules)

function Rules({ onShowRows }: { onShowRows: (rule: SurfaceRuleId) => void }) {
  return (
    <Card className="[--card-spacing:0px]">
      {RULE_GROUPS.map((group) => (
        <section key={group.label}>
          {/* The drawer's section band, so the rules read in blocks. */}
          <h3 className="bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground">
            {group.label}
          </h3>
          <ItemGroup className="gap-0">
            {group.rules.map((id, index) => {
              const rule = SURFACE_RULES.find((entry) => entry.id === id)!
              const count = breaking(id)
              return (
                <React.Fragment key={id}>
                  {index > 0 ? <Separator /> : null}
                  <Item className="items-start gap-4 rounded-none px-4 py-4">
                    <span className="w-5 shrink-0 text-sm text-muted-foreground tabular-nums">
                      {RULE_ORDER.indexOf(id) + 1}
                    </span>
                    <ItemContent className="gap-1">
                      <span className="text-sm font-medium">{rule.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {rule.detail}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Seen in {rule.seenIn}
                      </span>
                    </ItemContent>
                    <div className="flex w-40 shrink-0 justify-end">
                      {count ? (
                        <Button
                          onClick={() => onShowRows(id)}
                          size="sm"
                          variant="outline"
                        >
                          Sarj breaks it {count}×
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sarj keeps it
                        </span>
                      )}
                    </div>
                  </Item>
                </React.Fragment>
              )
            })}
          </ItemGroup>
        </section>
      ))}
    </Card>
  )
}

/* -------------------------------------------------------------------------
 * The dry run
 * ---------------------------------------------------------------------- */

const VERDICT_TINT: Record<Verdict, string> = {
  keep: "bg-success-tint text-success-tint-foreground",
  reshape: "bg-muted text-muted-foreground",
  move: "bg-primary-tint text-primary-tint-foreground",
  "add-confirm": "bg-warning-tint text-warning-tint-foreground",
  "drop-confirm": "bg-info-tint text-info-tint-foreground",
  "add-undo": "bg-info-tint text-info-tint-foreground",
}

function options(values: string[], label = (value: string) => value) {
  return Array.from(new Set(values)).map((value) => ({
    value,
    label: label(value),
  }))
}

const AREA_OPTIONS = options(SURFACE_AUDIT.map((row) => row.area))
const VERDICT_OPTIONS = options(
  SURFACE_AUDIT.map((row) => row.verdict),
  (value) => VERDICT_LABEL[value as Verdict],
)
const TODAY_OPTIONS = options(SURFACE_AUDIT.map((row) => row.today))
const SHOULD_OPTIONS = SURFACE_CHOICES.map((choice) => ({
  value: choice.id,
  label: choice.title,
}))
const BREAKS_OPTIONS = SURFACE_RULES.map((rule) => ({
  value: rule.id,
  label: rule.label,
}))

function matches(row: AuditRow, filters: AuditFilters) {
  const query = filters.query.trim().toLowerCase()
  return (
    (!query ||
      row.what.toLowerCase().includes(query) ||
      row.file.toLowerCase().includes(query)) &&
    (!filters.areas.length || filters.areas.includes(row.area)) &&
    (!filters.verdicts.length || filters.verdicts.includes(row.verdict)) &&
    (!filters.today.length || filters.today.includes(row.today)) &&
    (!filters.should.length || filters.should.includes(row.should)) &&
    (!filters.breaks.length ||
      filters.breaks.some((rule) => row.breaks.includes(rule as SurfaceRuleId)))
  )
}

/** "36 move" — the counts line, in the order a reader would act on them. */
const VERDICT_ORDER: Verdict[] = [
  "move",
  "reshape",
  "add-confirm",
  "add-undo",
  "drop-confirm",
  "keep",
]

function DryRun({
  filters,
  onFiltersChange,
}: {
  filters: AuditFilters
  onFiltersChange: (filters: AuditFilters) => void
}) {
  const [pageSize, setPageSize] = React.useState(25)
  const [page, setPage] = React.useState(0)
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  const set = (patch: Partial<AuditFilters>) => {
    onFiltersChange({ ...filters, ...patch })
    setPage(0)
  }

  const rows = SURFACE_AUDIT.filter((row) => matches(row, filters))
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pages - 1)
  const visible = rows.slice(current * pageSize, (current + 1) * pageSize)

  const counts = VERDICT_ORDER.map((verdict) => ({
    verdict,
    count: SURFACE_AUDIT.filter((row) => row.verdict === verdict).length,
  })).filter((entry) => entry.count)

  const activeCount = [
    filters.areas,
    filters.verdicts,
    filters.today,
    filters.should,
    filters.breaks,
  ].filter((value) => value.length).length

  return (
    <div className="flex flex-col gap-4">
      {/* The verdicts are the point of this tab, so they lead it — and each
          is the filter for its own rows, one click in and one click out. */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {SURFACE_AUDIT.length} overlays in the platform, 28 September 2026
        </p>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
          {counts.map((entry) => {
            const selected = filters.verdicts.includes(entry.verdict)
            return (
              <Item
                asChild
                className={cn(
                  "flex-col items-start gap-1 p-3 text-start transition-colors duration-150 ease-out-cubic motion-reduce:transition-none",
                  selected
                    ? "border-primary ring-1 ring-primary"
                    : "hover:bg-muted/50",
                )}
                key={entry.verdict}
                variant="outline"
              >
                <button
                  aria-pressed={selected}
                  onClick={() =>
                    set({
                      verdicts: selected
                        ? filters.verdicts.filter(
                            (value) => value !== entry.verdict,
                          )
                        : [...filters.verdicts, entry.verdict],
                    })
                  }
                  type="button"
                >
                  <span className="text-2xl font-semibold tabular-nums">
                    {entry.count}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {VERDICT_LABEL[entry.verdict]}
                  </span>
                </button>
              </Item>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search overlays"
            onChange={(event) => set({ query: event.target.value })}
            placeholder="Search by name or file..."
            value={filters.query}
          />
        </InputGroup>

        <FilterBar
          activeCount={activeCount}
          onClearAll={() =>
            onFiltersChange({ ...NO_FILTERS, query: filters.query })
          }
        >
          <SelectFilter
            field="Verdict"
            onChange={(verdicts) => set({ verdicts })}
            options={VERDICT_OPTIONS}
            value={filters.verdicts}
          />
          <SelectFilter
            field="Should be"
            onChange={(should) => set({ should })}
            options={SHOULD_OPTIONS}
            value={filters.should}
          />
          <SelectFilter
            field="Breaks"
            onChange={(breaks) => set({ breaks })}
            options={BREAKS_OPTIONS}
            value={filters.breaks}
          />
          <SelectFilter
            field="Today"
            onChange={(today) => set({ today })}
            options={TODAY_OPTIONS}
            value={filters.today}
          />
          <SelectFilter
            field="Area"
            onChange={(areas) => set({ areas })}
            options={AREA_OPTIONS}
            value={filters.areas}
          />
        </FilterBar>
      </div>

      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Overlay</DataTableHead>
            <DataTableHead>Area</DataTableHead>
            <DataTableHead>Today</DataTableHead>
            <DataTableHead>Should be</DataTableHead>
            <DataTableHead>Verdict</DataTableHead>
            <DataTableHead>Fix</DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {visible.length ? (
            visible.map((row) => (
              <TableRow
                className="cursor-pointer"
                key={row.id}
                onClick={() => setOpenIndex(rows.indexOf(row))}
              >
                <TableCell className="font-medium">{row.what}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.area}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.today}
                  {row.width ? (
                    <span className="tabular-nums"> · {row.width}</span>
                  ) : null}
                </TableCell>
                <TableCell>{SURFACE_TITLE[row.should]}</TableCell>
                <TableCell>
                  <Badge
                    className={VERDICT_TINT[row.verdict]}
                    variant="secondary"
                  >
                    {VERDICT_LABEL[row.verdict]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate text-muted-foreground">
                  {row.fix}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={6}
              >
                No overlay matches these filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTable>

      <ListFooter
        atEnd={current >= pages - 1}
        atStart={current === 0}
        from={rows.length ? current * pageSize + 1 : 0}
        noun="overlays"
        onFirst={() => setPage(0)}
        onNext={() => setPage(current + 1)}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(0)
        }}
        onPrevious={() => setPage(current - 1)}
        pageSize={pageSize}
        shown={visible.length}
        total={rows.length}
      />

      <AuditRecord index={openIndex} onIndexChange={setOpenIndex} rows={rows} />
    </div>
  )
}

/**
 * One row of the dry run, opened as what the decision says it is: a record,
 * from a list, with ↑ ↓ through whatever the filters left.
 */
function AuditRecord({
  rows,
  index,
  onIndexChange,
}: {
  rows: AuditRow[]
  index: number | null
  onIndexChange: (index: number | null) => void
}) {
  const row = index === null ? null : rows[index]

  const step = (by: number) => {
    if (index === null) return
    onIndexChange(Math.min(rows.length - 1, Math.max(0, index + by)))
  }
  useRecordKeys(row !== null, step)

  return (
    <Drawer
      direction="right"
      onOpenChange={(open) => (open ? null : onIndexChange(null))}
      open={row !== null}
    >
      <DrawerContent className="sm:max-w-5xl!">
        {row ? (
          <>
            <DrawerHeader className="flex flex-row items-center justify-between gap-4 border-b">
              <div className="flex min-w-0 flex-col gap-0.5">
                <DrawerTitle>{row.what}</DrawerTitle>
                <DrawerDescription className="truncate font-mono">
                  {row.file}
                </DrawerDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {(index ?? 0) + 1} of {rows.length}
                </span>
                <ButtonGroup>
                  <Button
                    aria-label="Previous overlay"
                    disabled={index === 0}
                    onClick={() => step(-1)}
                    size="icon-sm"
                    variant="outline"
                  >
                    <PreviousRecordIcon />
                  </Button>
                  <Button
                    aria-label="Next overlay"
                    disabled={index === rows.length - 1}
                    onClick={() => step(1)}
                    size="icon-sm"
                    variant="outline"
                  >
                    <NextRecordIcon />
                  </Button>
                </ButtonGroup>
                <DrawerClose asChild>
                  <Button aria-label="Close" size="icon-sm" variant="ghost">
                    <CloseIcon />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex min-h-0 flex-1">
              <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Fix
                  </span>
                  <p className="text-base">{row.fix}</p>
                </div>
                {row.breaks.length ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Breaks
                    </span>
                    <ul className="flex flex-col gap-1 text-sm">
                      {row.breaks.map((rule) => (
                        <li key={rule}>{RULE_LABEL[rule]}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Should be
                  </span>
                  <div className="w-64">
                    <SurfaceDiagram variant={row.should} />
                  </div>
                </div>
              </div>

              <dl className="flex w-72 shrink-0 flex-col gap-4 border-s p-4">
                {[
                  ["Area", row.area],
                  ["The reader is", row.doing],
                  [
                    "Today",
                    row.width ? `${row.today} · ${row.width}` : row.today,
                  ],
                  ["Should be", SURFACE_TITLE[row.should]],
                  ["Verdict", VERDICT_LABEL[row.verdict]],
                ].map(([term, value]) => (
                  <div className="flex flex-col gap-0.5" key={term}>
                    <dt className="text-xs text-muted-foreground">{term}</dt>
                    <dd className="text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
