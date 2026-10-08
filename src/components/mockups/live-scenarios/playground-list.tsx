"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import { StatusChip } from "@/components/mockups/live-scenarios/status-chip"
import { SearchScenariosIcon } from "@/components/mockups/live-scenarios/icons"
import { SCENARIOS } from "@/lib/mockups/live-scenarios-data"
import { cn } from "@/lib/utils"

/**
 * The playground's scenario list — the column the product shows beside the
 * call — with the Live chip on a live scenario, as Kidus asked for on
 * PROD-234. A test call from here runs the scenario callers hear, so the
 * chip is worth seeing before picking one. Only a live scenario carries a
 * chip: every scenario in this list is active, so "Active" would say nothing.
 *
 * The call panel to the right, and the rest of the column, are unchanged
 * and left out.
 */
/**
 * The design system's Selection pattern (Patterns › Selection): picking one
 * moves the card's edge and nothing else — no tint, no tick — and only an
 * unpicked card takes a hover.
 */
const SELECTED = "border-primary ring-1 ring-primary"

export function PlaygroundList() {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState(SCENARIOS[2].id)

  const rows = SCENARIOS.filter((row) =>
    row.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className="flex h-full w-80 flex-col border-e bg-background">
      <div className="p-4 pb-3">
        <InputGroup>
          <InputGroupAddon>
            <SearchScenariosIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search scenarios"
            placeholder="Search scenarios..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        {rows.map((row) => (
          <Item
            key={row.id}
            asChild
            variant="outline"
            className={cn(row.id === selected && SELECTED)}
          >
            <button
              aria-pressed={row.id === selected}
              className={cn(
                "w-full text-start",
                row.id !== selected && "hover:bg-muted/50",
              )}
              onClick={() => setSelected(row.id)}
              type="button"
            >
              <ItemContent>
                <ItemTitle className="truncate">{row.name}</ItemTitle>
                <span className="flex items-center gap-1">
                  {row.live ? <StatusChip live /> : null}
                  {row.languages.map((code) => (
                    <Badge
                      key={code}
                      className="bg-muted text-muted-foreground"
                      variant="secondary"
                    >
                      {code}
                    </Badge>
                  ))}
                </span>
              </ItemContent>
            </button>
          </Item>
        ))}
      </div>
    </div>
  )
}
