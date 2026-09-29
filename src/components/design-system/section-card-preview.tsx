"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import {
  CreateInListIcon,
  RowMenuIcon,
  SectionToggleIcon,
} from "@/components/design-system/icons"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import { cn } from "@/lib/utils"

/**
 * The scenario page's section card, four ways.
 *
 * The product stacks nine muted cards and lets every section component draw
 * its own header, so there are five title sizes (text-xl, text-lg semibold,
 * text-lg medium, text-base, a bare Label), three description sizes, an icon
 * tile on one card and a loose icon on another, a Card nested inside the muted
 * Card on three of them, and the one control each needs — a switch, a count,
 * "Add Tool" — wherever that component put it. Where the control shares a row
 * with a two-line description, the row wraps and the control drops.
 *
 * Every take below fixes the same four things: one header, drawn by the card
 * rather than by what is inside it; one title size; the description on its own
 * line, never sharing a row with the control; and no card inside a card. They
 * differ in where the header sits and how much of the page it takes.
 */

/* ------------------------------------------------------------------- data */

type SectionId = "first-message" | "variables" | "analytics" | "tools" | "kb"

type Section = {
  id: SectionId
  title: string
  description: string
  /** A count beside the title — what the section holds. */
  count?: number
  /** A switch the whole section depends on. Off, its body is absent. */
  toggle?: string
  /** The one way to add to the section. */
  add?: string
}

/* Titles and descriptions are the platform's own, in sentence case and cut to
   one line each. */
const SECTIONS: Section[] = [
  {
    id: "first-message",
    title: "First message",
    description:
      "What the agent says when the call connects. {{name}} is filled in per call.",
    toggle: "Open with this message",
  },
  {
    id: "variables",
    title: "Template variables",
    description: "Found in the prompt and the first message.",
    count: 4,
  },
  {
    id: "analytics",
    title: "Call analytics and data collection",
    description:
      "What the agent gathers from each conversation, for reports and your CRM.",
    count: 3,
    toggle: "Collect data",
  },
  {
    id: "tools",
    title: "Agent tools",
    description: "What the agent can do during a call besides talk.",
    count: 3,
    add: "Add tool",
  },
  {
    id: "kb",
    title: "Knowledge bases",
    description:
      "Searched when a question needs them. Say when each one applies.",
    count: 2,
    add: "Attach",
  },
]

const VARIABLES = [
  { name: "name", type: "Text", required: true },
  { name: "account_number", type: "Text", required: true },
  { name: "due_date", type: "Date", required: false },
  { name: "amount_due", type: "Number", required: false },
]

const FIELDS = [
  { name: "Payment promised", type: "Yes or no" },
  { name: "Promise date", type: "Date" },
  { name: "Reason for delay", type: "Text" },
]

const TOOLS = [
  { name: "End call", detail: "Hangs up with a polite goodbye" },
  { name: "Schedule callback", detail: "Books a time to call back" },
  { name: "Collect digits", detail: "Reads a number typed on the keypad" },
]

const KNOWLEDGE = [
  { name: "Payment FAQ", detail: "When the customer asks how to pay" },
  { name: "Late fees 2026", detail: "When the customer disputes a fee" },
]

const FIRST_MESSAGE =
  "Hi {{name}}, this is Sara from Sarj. Is now a good time to talk?"

/* ------------------------------------------------------------------ state */

type Toggles = Record<SectionId, boolean>

function useToggles() {
  const [on, setOn] = React.useState<Toggles>({
    "first-message": true,
    variables: true,
    analytics: true,
    tools: true,
    kb: true,
  })
  const set = (id: SectionId, value: boolean) =>
    setOn((current) => ({ ...current, [id]: value }))
  return { on, set }
}

/** One line that says what a section holds, for the collapsed take. */
function summary(id: SectionId, on: boolean) {
  if (!on) return "Off"
  switch (id) {
    case "first-message":
      return FIRST_MESSAGE
    case "variables":
      return `${VARIABLES.filter((v) => v.required).length} required`
    case "analytics":
      return FIELDS.map((field) => field.name).join(", ")
    case "tools":
      return TOOLS.map((tool) => tool.name).join(", ")
    case "kb":
      return KNOWLEDGE.map((kb) => kb.name).join(", ")
  }
}

/* ------------------------------------------------------------------ parts */

/** The section's body — the same in every take. */
function Body({ id }: { id: SectionId }) {
  switch (id) {
    case "first-message":
      return <Input aria-label="First message" defaultValue={FIRST_MESSAGE} />
    case "variables":
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variable</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-end">Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {VARIABLES.map((variable) => (
              <TableRow key={variable.name}>
                <TableCell className="font-mono text-xs">
                  {variable.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {variable.type}
                </TableCell>
                <TableCell className="text-end">
                  <Switch
                    aria-label={`${variable.name} required`}
                    defaultChecked={variable.required}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    case "analytics":
      return (
        <Rows rows={FIELDS.map((f) => ({ name: f.name, detail: f.type }))} />
      )
    case "tools":
      return <Rows rows={TOOLS} />
    case "kb":
      return <Rows rows={KNOWLEDGE} />
  }
}

function Rows({ rows }: { rows: { name: string; detail: string }[] }) {
  return (
    <ItemGroup className="gap-2">
      {rows.map((row) => (
        <Item key={row.name} size="sm" variant="outline">
          <ItemContent>
            <ItemTitle>{row.name}</ItemTitle>
            <ItemDescription>{row.detail}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              aria-label={`${row.name} options`}
              size="icon-sm"
              variant="ghost"
            >
              <RowMenuIcon />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}

/** The section's one control: its switch, or its way to add. */
function Control({
  section,
  on,
  onToggle,
}: {
  section: Section
  on: boolean
  onToggle: (value: boolean) => void
}) {
  if (section.toggle)
    return (
      <Switch
        aria-label={section.toggle}
        checked={on}
        onCheckedChange={onToggle}
      />
    )
  if (section.add)
    return (
      <Button size="sm" variant="outline">
        <CreateInListIcon />
        {section.add}
      </Button>
    )
  return null
}

function Title({
  section,
  onBand = false,
}: {
  section: Section
  /** On the shaded band a secondary badge disappears into it. */
  onBand?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-base font-medium">{section.title}</h3>
      {section.count !== undefined ? (
        <Badge variant={onBand ? "outline" : "secondary"}>
          {section.count}
        </Badge>
      ) : null}
    </div>
  )
}

/* --------------------------------------------------------------- variants */

/**
 * Title row. Title and count on the first line with the control at its end,
 * pinned to that line; the description under both, alone. The smallest change
 * from what ships.
 */
function TitleRowTake() {
  const { on, set } = useToggles()
  return (
    <div className="flex flex-col gap-4">
      {SECTIONS.map((section) => (
        <Card key={section.id}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex h-8 items-center justify-between gap-4">
                <Title section={section} />
                <Control
                  on={on[section.id]}
                  onToggle={(value) => set(section.id, value)}
                  section={section}
                />
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
            {on[section.id] ? <Body id={section.id} /> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Band. The header is a shaded band across the top of the card — the drawer's
 * section band and a table's header row, the same shape a third time — so
 * title, count and control sit on one line that cannot wrap into the body.
 * The description opens the body.
 */
function BandTake() {
  const { on, set } = useToggles()
  return (
    <div className="flex flex-col gap-4">
      {SECTIONS.map((section) => (
        <Card key={section.id}>
          {/* Flush with the card's top edge: the card's own spacing, taken
              back. */}
          <div className="-mt-(--card-spacing) flex h-12 items-center justify-between gap-4 border-b bg-muted/60 px-4">
            <Title onBand section={section} />
            <Control
              on={on[section.id]}
              onToggle={(value) => set(section.id, value)}
              section={section}
            />
          </div>
          <CardContent className="flex flex-col gap-4">
            <p className="max-w-2xl text-sm text-muted-foreground">
              {section.description}
            </p>
            {on[section.id] ? <Body id={section.id} /> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Side column. One sheet instead of five cards: each section is a row, the
 * title, description and control in a fixed column on the start side, the
 * content beside it. A long description gets a column of its own instead of
 * a row it has to share — the settings layout Stripe and Vercel use.
 */
function SideColumnTake() {
  const { on, set } = useToggles()
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        {SECTIONS.map((section, index) => (
          <React.Fragment key={section.id}>
            {index > 0 ? <Separator /> : null}
            <div className="grid gap-6 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
              <div className="flex flex-col items-start gap-3">
                <div className="flex flex-col gap-1">
                  <Title section={section} />
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <Control
                  on={on[section.id]}
                  onToggle={(value) => set(section.id, value)}
                  section={section}
                />
              </div>
              <div className="min-w-0">
                {on[section.id] ? <Body id={section.id} /> : null}
              </div>
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * Summary. Every section folds to one line that says what it holds —
 * "End call, Schedule callback, Collect digits" — so the whole scenario reads
 * in one screen, and a section opens only to change it. The description
 * lives inside, since it is for the first visit, not every one. The switch
 * stays on the folded line because on or off is part of the summary.
 */
function SummaryTake() {
  const { on, set } = useToggles()
  return (
    <div className="flex flex-col gap-3">
      {SECTIONS.map((section, index) => (
        <Collapsible defaultOpen={index === 0} key={section.id}>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex h-8 items-center gap-4">
                <CollapsibleTrigger asChild>
                  {/* Raw on purpose: an asChild child, and the whole line is
                      the target. */}
                  <button
                    className="group flex min-w-0 flex-1 items-center gap-4 text-start outline-none"
                    type="button"
                  >
                    <SectionToggleIcon className="shrink-0 text-muted-foreground transition-transform duration-200 ease-out-cubic group-data-[state=closed]:-rotate-90 motion-reduce:transition-none" />
                    <span className="shrink-0">
                      <Title section={section} />
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-end text-sm text-muted-foreground group-data-[state=open]:invisible",
                        section.id === "first-message" && "italic",
                      )}
                    >
                      {summary(section.id, on[section.id])}
                    </span>
                  </button>
                </CollapsibleTrigger>
                {section.toggle ? (
                  <Control
                    on={on[section.id]}
                    onToggle={(value) => set(section.id, value)}
                    section={section}
                  />
                ) : null}
              </div>
              {/* Indented to the title, past the chevron: the chevron's 16px
                  and the 16px gap after it. */}
              <CollapsibleContent className="flex flex-col gap-4 ps-8">
                <div className="flex items-start justify-between gap-4">
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {section.description}
                  </p>
                  {section.add ? (
                    <Control
                      on={on[section.id]}
                      onToggle={(value) => set(section.id, value)}
                      section={section}
                    />
                  ) : null}
                </div>
                {on[section.id] ? <Body id={section.id} /> : null}
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------- page */

const TAKES = [
  { id: "title-row", label: "Title row", View: TitleRowTake },
  { id: "band", label: "Band", View: BandTake },
  { id: "side-column", label: "Side column", View: SideColumnTake },
  { id: "summary", label: "Summary", View: SummaryTake },
]

export function SectionCardPreview() {
  const [take, setTake] = React.useState("title-row")

  return (
    <SecondaryTabs items={TAKES} onValueChange={setTake} value={take}>
      {TAKES.map(({ id, View }) => (
        <TabsContent key={id} value={id}>
          <div className="flex flex-col gap-6">
            <PageHeader title="Payment reminder" />
            <View />
          </div>
        </TabsContent>
      ))}
    </SecondaryTabs>
  )
}
