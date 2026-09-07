"use client"

import * as React from "react"

import {
  ReferenceLabel,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"
import { cn } from "@/lib/utils"

/**
 * What a card looks like when it is the one you picked.
 *
 * Selection moves the card's edge and changes nothing else. A tint repaints
 * the ground every badge and every line of text sits on, so the card you
 * picked stops matching the ones you are comparing it against — at the moment
 * you are comparing them. And a fill, a coloured border and a tick together
 * spend three signals on one bit of state.
 *
 * How many you can pick decides whether anything joins the edge. Picking one
 * needs no mark: exactly one card carries it, and whatever the choice feeds is
 * on screen already showing which. Picking several needs a checkbox, because
 * "how many are on" is not a question an edge answers — and a checkbox is a
 * control, so it is the thing to click as well as the thing to read.
 */

const AGENTS = [
  { id: "support", name: "Support triage", languages: ["English", "Arabic"] },
  { id: "collections", name: "Collections", languages: ["Arabic"] },
  { id: "onboarding", name: "Onboarding", languages: ["English", "Arabic"] },
]

/**
 * The whole pattern. `border-primary` alone is 1px of brand against 1px of
 * grey, which is a colour change rather than an edge; the ring doubles it
 * without taking any space, so nothing reflows when a card is picked.
 */
const SELECTED = "border-primary ring-1 ring-primary"

const RULES = [
  {
    part: "The edge",
    what: "border-primary ring-1 ring-primary",
    why: "The one thing selection changes. The ring costs no layout, so picking a card never moves the ones under it.",
  },
  {
    part: "The surface",
    what: "bg-card — unchanged",
    why: "A tint repaints the ground the content sits on, and the picked card stops matching the ones beside it.",
  },
  {
    part: "The checkbox",
    what: "Only where you can pick several",
    why: "It answers how many are on, which an edge cannot. Picking one needs no mark — exactly one card has the edge.",
  },
  {
    part: "Hover",
    what: "bg-muted/50, on the unselected only",
    why: "Half strength because a badge is bg-secondary and that is the same grey — at full muted the chips on a hovered card dissolve into it. The selected card is already at its final state, so it does not take a hover at all.",
  },
]

export function SelectionPreview() {
  const [one, setOne] = React.useState(AGENTS[0].id)
  const [several, setSeveral] = React.useState<string[]>([AGENTS[0].id])

  const toggle = (id: string) =>
    setSeveral((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium">Picking one</span>

          <div className="flex flex-col gap-2">
            {AGENTS.map((agent) => {
              const selected = agent.id === one

              return (
                <Item
                  asChild
                  className={cn(selected && SELECTED)}
                  key={agent.id}
                  variant="outline"
                >
                  {/* The card is the control, so it is a button rather than a
                      div with a click on it — that is what makes it reachable
                      by keyboard and what announces the state. */}
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "w-full text-start",
                      !selected && "hover:bg-muted/50",
                    )}
                    onClick={() => setOne(agent.id)}
                    type="button"
                  >
                    <ItemContent>
                      <ItemTitle>{agent.name}</ItemTitle>
                      <div className="flex gap-2">
                        {agent.languages.map((language) => (
                          <Badge key={language} variant="secondary">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </ItemContent>
                  </button>
                </Item>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium">Picking several</span>

          <div className="flex flex-col gap-2">
            {AGENTS.map((agent) => {
              const selected = several.includes(agent.id)

              return (
                <Item
                  asChild
                  className={cn(selected && SELECTED)}
                  key={agent.id}
                  variant="outline"
                >
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "w-full text-start",
                      !selected && "hover:bg-muted/50",
                    )}
                    onClick={() => toggle(agent.id)}
                    type="button"
                  >
                    <ItemContent>
                      <ItemTitle>{agent.name}</ItemTitle>
                      <div className="flex gap-2">
                        {agent.languages.map((language) => (
                          <Badge key={language} variant="secondary">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </ItemContent>
                    <ItemActions>
                      {/* The card already carries the state and the click, so
                          the box is the readout, not a second control — a
                          checkbox inside a button is a control inside a
                          control, and neither the pointer nor the screen
                          reader can tell which one it just used. */}
                      <Checkbox
                        aria-hidden
                        checked={selected}
                        className="pointer-events-none"
                        tabIndex={-1}
                      />
                    </ItemActions>
                  </button>
                </Item>
              )
            })}
          </div>
        </div>
      </div>

      <ReferenceTable
        columns={[
          { header: "Part", width: "w-40" },
          { header: "What it is", width: "w-72" },
          { header: "Why" },
        ]}
        rows={RULES.map((rule) => ({
          key: rule.part,
          cells: [
            <ReferenceLabel key="p">{rule.part}</ReferenceLabel>,
            <ReferenceLabel key="w">{rule.what}</ReferenceLabel>,
            <ReferenceNote key="y">{rule.why}</ReferenceNote>,
          ],
        }))}
      />
    </div>
  )
}
