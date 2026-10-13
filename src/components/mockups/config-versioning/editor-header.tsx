"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  HistoryIcon,
  MoreActionsIcon,
  RunScenarioIcon,
  StatusMenuIcon,
} from "@/components/mockups/config-versioning/icons"
import type { Subject } from "@/lib/mockups/config-versioning-data"
import { cn } from "@/lib/utils"

/**
 * The top of the editor: DES-203's status-menu header, which was picked
 * there, with versioning added in the two places it fits.
 *
 *  - The line under the title says who published the live version and
 *    when, or on a not-live scenario who saved last. No version numbers:
 *    the editor speaks of "the live version" and "the latest" (review,
 *    13 Oct 2026), and History is where numbers are.
 *  - History sits beside the Live button. The page's other actions are
 *    DES-203's, unchanged.
 *
 * The global prompt is always live and has no switch (PRD), so it gets the
 * line and History only.
 */
export function EditorHeader({
  subject,
  canEdit,
  onOpenHistory,
  onToggleLive,
}: {
  subject: Subject
  /** No longer shown — the header names no version. Kept so DES-204's
   *  editor, which passes it, still compiles. */
  base?: number
  canEdit: boolean
  onOpenHistory: () => void
  onToggleLive: (on: boolean) => void
}) {
  const newest = subject.versions[0]
  const live = subject.marker !== null

  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="text-2xl font-semibold">{subject.name}</h1>
        <p className="text-sm text-muted-foreground">
          {/* Each phrase wraps as a unit, never mid-name. */}
          {live && subject.published ? (
            <>
              <span className="whitespace-nowrap">
                Live version published by {subject.published.by},
              </span>{" "}
              <span className="whitespace-nowrap">{subject.published.at}</span>
            </>
          ) : (
            <span className="whitespace-nowrap">
              Saved by {newest.author}, {newest.at}
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {subject.kind === "scenario" ? (
          <LiveMenu
            canToggle={canEdit}
            live={live}
            marker={subject.marker}
            newest={newest.n}
            onToggle={onToggleLive}
            toggled={subject.toggled}
          />
        ) : null}
        <Button onClick={onOpenHistory} variant="outline">
          <HistoryIcon />
          History
        </Button>
        {subject.kind === "scenario" ? (
          <>
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
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
      </div>
    </header>
  )
}

/**
 * DES-203's Live button and popover. One case is new: turning live off while
 * the marker sits behind newer saves would quietly start running the newest
 * version (the PRD's open question), so that one asks first and names both
 * versions.
 */
function LiveMenu({
  live,
  marker,
  newest,
  canToggle,
  onToggle,
  toggled,
}: {
  live: boolean
  marker: number | null
  newest: number
  canToggle: boolean
  onToggle: (on: boolean) => void
  toggled: Subject["toggled"]
}) {
  const [confirming, setConfirming] = React.useState(false)
  const behind = live && marker !== null && marker < newest

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                live ? "bg-success" : "bg-muted-foreground/40",
              )}
            />
            {live ? "Live" : "Not live"}
            <StatusMenuIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="live-switch">Live</Label>
              {/* Toggling makes no version, so the record of it lives here. */}
              {toggled ? (
                <span className="text-xs text-muted-foreground">
                  Turned {live ? "on" : "off"} by {toggled.by}, {toggled.at}
                </span>
              ) : null}
            </div>
            <Switch
              checked={live}
              disabled={!canToggle}
              id="live-switch"
              onCheckedChange={(on) => {
                if (!on && behind) {
                  setConfirming(true)
                  return
                }
                onToggle(on)
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {!canToggle
              ? "You don't have permission to change this."
              : live
                ? "Saving makes a version; publishing puts it on calls."
                : "Turning it on makes the latest version live."}
          </p>
        </PopoverContent>
      </Popover>

      <AlertDialog onOpenChange={setConfirming} open={confirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn off live?</AlertDialogTitle>
            <AlertDialogDescription>
              The latest version starts running instead of the live one from the
              next call, without a publish. Every version stays in history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onToggle(false)}>
              Turn off live
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
