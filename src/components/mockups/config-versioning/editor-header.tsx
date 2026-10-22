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
  HistoryIcon,
  MoreActionsIcon,
  RunScenarioIcon,
} from "@/components/mockups/config-versioning/icons"
import type { Subject } from "@/lib/mockups/config-versioning-data"

/**
 * The top of the editor: DES-203's header — title, the Live switch (shared
 * with DES-203, so the two never drift), Run scenario and the more menu —
 * with versioning added in the two places it fits.
 *
 *  - The line under the title says who put the version in use there, and
 *    how: published, applied, or (on a scenario that is not live) saved. No
 *    version numbers: the editor speaks of "the version in use" and "the
 *    latest" (review, 13 Oct 2026), and History is where numbers are.
 *  - History sits beside the Live switch. The page's other actions are
 *    DES-203's, unchanged.
 */
export function EditorHeader({
  subject,
  canEdit,
  canToggle = canEdit,
  onOpenHistory,
  onToggleLive,
}: {
  subject: Subject
  /** No longer shown — the header names no version. Kept so DES-204's
   *  editor, which passes it, still compiles. */
  base?: number
  canEdit: boolean
  /** Turning live on or off is its own permission (TDD 3.1), separate from
   *  editing. Defaults to the edit permission. */
  canToggle?: boolean
  onOpenHistory: () => void
  onToggleLive: (on: boolean) => void
}) {
  const [applied] = subject.log

  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="text-2xl font-semibold">{subject.name}</h1>
        <p className="text-sm text-muted-foreground">
          {/* Each phrase wraps as a unit, never mid-name. */}
          <span className="whitespace-nowrap">
            Version in use {applied.how} by {applied.by},
          </span>{" "}
          <span className="whitespace-nowrap">{applied.at}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <LiveSwitch
          canToggle={canToggle}
          live={subject.live}
          onToggle={onToggleLive}
          toggled={subject.toggled}
        />
        <Button onClick={onOpenHistory} variant="outline">
          <HistoryIcon />
          History
        </Button>
        <Button>
          <RunScenarioIcon />
          Run scenario
        </Button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button aria-label="More actions" size="icon" variant="outline">
              <MoreActionsIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Export scenario</DropdownMenuItem>
            <DropdownMenuItem>Import scenario</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
