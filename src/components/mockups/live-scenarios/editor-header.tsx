"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  RunScenarioIcon,
  ScenarioMenuIcon,
  StatusMenuIcon,
} from "@/components/mockups/live-scenarios/icons"
import type { LiveRecord } from "@/lib/mockups/live-scenarios-data"
import { cn } from "@/lib/utils"

/**
 * The top of the scenario editor, two ways. Each puts the title and the
 * page's actions on one row — the first take floated the actions on a row
 * of their own above the title — and each says Live once: the first take
 * had a Live switch and a Live chip a few centimetres apart.
 *
 *  - Status strip: an outlined row under the title owns the state, who set
 *    it, its consequence and the switch. It is also where DES-202 puts the
 *    version being edited and the version that is live, so it grows into
 *    versioning rather than being replaced by it.
 *  - Status menu: one button is both the indicator and the control. It
 *    opens a popover holding the switch and who turned it on.
 */

export const HEADER_VARIANTS = [
  { id: "strip", label: "Status strip" },
  { id: "menu", label: "Status menu" },
] as const

export type HeaderVariant = (typeof HEADER_VARIANTS)[number]["id"]

type HeaderProps = {
  variant: HeaderVariant
  scenario: string
  live: LiveRecord | null
  pending: boolean
  canToggle: boolean
  onToggle: (on: boolean) => void
  onDelete: () => void
}

const CREATED = "Created 28 Sep 2026, 17:06"

export function EditorHeader(props: HeaderProps) {
  if (props.variant === "menu") return <MenuHeader {...props} />
  return <StripHeader {...props} />
}

/* ---------------------------------------------------------- status strip */

function StripHeader({
  scenario,
  live,
  pending,
  canToggle,
  onToggle,
  onDelete,
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold">{scenario}</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {CREATED}
          </p>
        </div>
        <PageActions onDelete={onDelete} />
      </div>

      <Item variant="outline">
        <ItemContent>
          <ItemTitle>
            <LiveDot live={live !== null} />
            {live ? "Live" : "Not live"}
            {live ? (
              <span className="font-normal text-muted-foreground tabular-nums">
                · {live.by}, {live.at}
              </span>
            ) : null}
          </ItemTitle>
          <ItemDescription>
            {live
              ? "Saving changes what callers hear from the next call."
              : "Turn on when this scenario handles real calls."}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          {pending ? <Spinner /> : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex">
                <Switch
                  aria-label="Live"
                  checked={live !== null}
                  disabled={!canToggle || pending}
                  onCheckedChange={onToggle}
                />
              </span>
            </TooltipTrigger>
            {canToggle ? null : (
              <TooltipContent>
                You don&apos;t have permission to change this
              </TooltipContent>
            )}
          </Tooltip>
        </ItemActions>
      </Item>
    </header>
  )
}

/* ----------------------------------------------------------- status menu */

function MenuHeader({
  scenario,
  live,
  pending,
  canToggle,
  onToggle,
  onDelete,
}: HeaderProps) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">{scenario}</h1>
        <p className="text-sm text-muted-foreground tabular-nums">{CREATED}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {pending ? <Spinner /> : <LiveDot live={live !== null} />}
              {live ? "Live" : "Not live"}
              <StatusMenuIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="live-menu-switch">Live</Label>
              <Switch
                id="live-menu-switch"
                checked={live !== null}
                disabled={!canToggle || pending}
                onCheckedChange={onToggle}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {!canToggle
                ? "You don't have permission to change this."
                : live
                  ? `Turned on by ${live.by}, ${live.at}.`
                  : "Turn on when this scenario handles real calls."}
            </p>
          </PopoverContent>
        </Popover>
        <PageActions onDelete={onDelete} />
      </div>
    </header>
  )
}

/* ---------------------------------------------------------------- shared */

function LiveDot({ live }: { live: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 shrink-0 rounded-full",
        live ? "bg-success" : "bg-muted-foreground/40",
      )}
    />
  )
}

function PageActions({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
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
  )
}
