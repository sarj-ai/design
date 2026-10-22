"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LiveSwitch } from "@/components/shared/live-switch"
import {
  RunScenarioIcon,
  ScenarioMenuIcon,
} from "@/components/mockups/live-scenarios/icons"
import type { LiveRecord } from "@/lib/mockups/live-scenarios-data"

/**
 * The top of the scenario editor: the title and the page's actions on one
 * row, with Live said once — as the switch itself, beside Run scenario.
 *
 * The switch is the one DES-202 uses (shared/live-switch.tsx), so live and
 * versioning ship the same control. It replaced two takes, a popover behind
 * a status button and a status strip under the title: the popover took two
 * clicks for one value, and the TDD asks for one click and nothing more
 * (feedback, 22 Oct 2026).
 */
export function EditorHeader({
  scenario,
  live,
  pending,
  canToggle,
  onToggle,
  onDelete,
}: {
  scenario: string
  live: LiveRecord | null
  pending: boolean
  canToggle: boolean
  onToggle: (on: boolean) => void
  onDelete: () => void
}) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">{scenario}</h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          Created 28 Sep 2026, 17:06
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LiveSwitch
          canToggle={canToggle}
          live={live !== null}
          onToggle={onToggle}
          pending={pending}
          toggled={live}
        />
        <Button>
          <RunScenarioIcon />
          Run scenario
        </Button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button aria-label="More actions" size="icon" variant="outline">
              <ScenarioMenuIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Export scenario</DropdownMenuItem>
            <DropdownMenuItem>Import scenario</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
