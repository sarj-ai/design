"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DirectionChip,
  OutcomeBadge,
  ScenarioChip,
  StatusBadge,
} from "@/components/mockups/conversations-revamp/list/status-badges"
import {
  CloseIcon,
  NextCallIcon,
  PreviousCallIcon,
} from "@/components/mockups/review-tracking/icons"
import type { CallRow } from "@/lib/mockups/conversations-revamp-list-data"

export function CallDrawer({
  call,
  calls,
  onStep,
  onClose,
  actions,
  description,
}: {
  call: CallRow | null
  /** The list the arrows walk, in on-screen order. */
  calls: CallRow[]
  onStep: (call: CallRow) => void
  onClose: () => void
  actions?: React.ReactNode
  /** Replaces the phone and scenario line. */
  description?: React.ReactNode
}) {
  const index = call ? calls.findIndex((item) => item.id === call.id) : -1
  const previous = index > 0 ? calls[index - 1] : null
  const next = index >= 0 && index < calls.length - 1 ? calls[index + 1] : null

  React.useEffect(() => {
    if (!call) return
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === "ArrowUp" && previous) onStep(previous)
      if (event.key === "ArrowDown" && next) onStep(next)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [call, previous, next, onStep])

  return (
    <Drawer
      direction="right"
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      open={call !== null}
    >
      <DrawerContent className="sm:max-w-5xl!">
        {call ? (
          <>
            <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
              <div className="flex min-w-0 flex-col gap-0.5">
                <DrawerTitle className="tabular-nums">
                  {call.createdAt}
                </DrawerTitle>
                <DrawerDescription className="tabular-nums">
                  {description ??
                    `${call.phoneNumber ?? "Chat"} · ${call.scenario}`}
                </DrawerDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {actions}
                <StepButton
                  disabled={!previous}
                  keyLabel="↑"
                  label="Previous call"
                  onClick={() => previous && onStep(previous)}
                  Icon={PreviousCallIcon}
                />
                <StepButton
                  disabled={!next}
                  keyLabel="↓"
                  label="Next call"
                  onClick={() => next && onStep(next)}
                  Icon={NextCallIcon}
                />
                <DrawerClose asChild>
                  <Button aria-label="Close" size="icon-sm" variant="ghost">
                    <CloseIcon />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <dl className="grid grid-cols-3 gap-x-6 gap-y-4 p-6">
              <Fact label="Call status">
                <StatusBadge
                  scheduleOrigin={call.scheduleOrigin}
                  status={call.status}
                />
              </Fact>
              <Fact label="Outcome">
                <OutcomeBadge status={call.outcome} />
              </Fact>
              <Fact label="Duration">
                <span className="text-sm font-medium tabular-nums">
                  {call.duration}
                </span>
              </Fact>
              <Fact label="Direction">
                {call.direction ? (
                  <DirectionChip direction={call.direction} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </Fact>
              <Fact label="Scenario">
                <ScenarioChip scenario={call.scenario} />
              </Fact>
              <Fact label="Placed by">
                <span className="text-sm">{call.user}</span>
              </Fact>
            </dl>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

function Fact({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function StepButton({
  label,
  keyLabel,
  disabled,
  onClick,
  Icon,
}: {
  label: string
  keyLabel: string
  disabled: boolean
  onClick: () => void
  Icon: React.ComponentType
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          size="icon-sm"
          variant="ghost"
        >
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {label} <Kbd>{keyLabel}</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
