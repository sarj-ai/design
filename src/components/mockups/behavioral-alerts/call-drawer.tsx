"use client"

import * as React from "react"
import type { PanelImperativeHandle } from "react-resizable-panels"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  CONFIGURED_ALERTS,
  OWNER,
  type CallRow,
} from "@/lib/mockups/behavioral-alerts-data"
import {
  CallCompletedIcon,
  CopyCallLinkIcon,
  CopyIdIcon,
  InboundIcon,
  LanguageIcon,
  OrganizationIcon,
  OutboundIcon,
  OwnerIcon,
  ShowPanelIcon,
  VoicemailIcon,
} from "@/components/mockups/behavioral-alerts/icons"
import { SectionRegister } from "@/components/mockups/behavioral-alerts/section-register"
import { SEVERITY_RULE } from "@/components/mockups/behavioral-alerts/severity"
import {
  TranscriptPanel,
  type Evidence,
} from "@/components/mockups/behavioral-alerts/transcript-panel"

export function CallDrawer({
  call,
  onConfigureAlerts,
  onOpenChange,
  open,
}: {
  call: CallRow | null
  onConfigureAlerts: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  if (!call) return null

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <DrawerBody
        call={call}
        key={call.id}
        onConfigureAlerts={onConfigureAlerts}
      />
    </Sheet>
  )
}

function DrawerBody({
  call,
  onConfigureAlerts,
}: {
  call: CallRow
  onConfigureAlerts: () => void
}) {
  const [at, setAt] = React.useState(0)
  const content = React.useRef<HTMLDivElement>(null)

  const transcript = React.useRef<PanelImperativeHandle>(null)
  const panel = React.useRef<PanelImperativeHandle>(null)
  const [hidden, setHidden] = React.useState<"none" | "panel" | "transcript">(
    "none",
  )

  const detections = call.analysis.detections

  const markers = detections.map((detection) => ({
    id: detection.id,
    label: alertName(detection.alertId),
    at: detection.at,
    tone: SEVERITY_RULE[detection.severity],
  }))

  const evidence = new Map<number, Evidence>(
    detections.map((detection) => [
      detection.at,
      { name: alertName(detection.alertId), severity: detection.severity },
    ]),
  )

  return (
    <SheetContent
      className="flex w-full flex-col sm:max-w-6xl! lg:overflow-hidden"
      // The resize handle stops pointerdown natively, so the dialog reads a
      // press on it as outside. Ignore presses that land inside the panel.
      onPointerDownOutside={(event) => {
        const target = event.detail.originalEvent.target
        if (target instanceof Node && content.current?.contains(target)) {
          event.preventDefault()
        }
      }}
      ref={content}
      // Off because it overlapped the Call ID button; Escape and the overlay
      // still close.
      showCloseButton={false}
    >
      <SheetTitle className="sr-only">Call details</SheetTitle>
      <SheetDescription className="sr-only">
        {call.scenario}, {call.phoneNumber}, {call.startedAt}
      </SheetDescription>

      <div className="flex min-h-0 flex-1 flex-col">
        <CallHeader
          actions={
            hidden === "none" ? null : (
              <Button
                onClick={() => {
                  ;(hidden === "transcript"
                    ? transcript
                    : panel
                  ).current?.expand()
                }}
                size="sm"
                variant="outline"
              >
                <ShowPanelIcon />
                {hidden === "transcript" ? "Show transcript" : "Show panel"}
              </Button>
            )
          }
          call={call}
        />

        {/* Sizes are strings on purpose: react-resizable-panels reads a number
           as pixels and a string as a percentage. */}
        <ResizablePanelGroup
          className="min-h-0 flex-1 p-4"
          orientation="horizontal"
        >
          <ResizablePanel
            collapsible
            defaultSize="62%"
            id="transcript"
            minSize="35%"
            onResize={(size) => {
              setHidden((current) =>
                size.asPercentage === 0
                  ? "transcript"
                  : current === "transcript"
                    ? "none"
                    : current,
              )
            }}
            panelRef={transcript}
          >
            <TranscriptPanel
              at={at}
              call={call}
              evidence={evidence}
              markers={markers}
              onSeek={setAt}
            />
          </ResizablePanel>

          <ResizableHandle className="mx-4" withHandle />

          <ResizablePanel
            collapsible
            defaultSize="38%"
            id="panel"
            minSize="22%"
            onResize={(size) => {
              setHidden((current) =>
                size.asPercentage === 0
                  ? "panel"
                  : current === "panel"
                    ? "none"
                    : current,
              )
            }}
            panelRef={panel}
          >
            <SectionRegister
              call={call}
              onConfigureAlerts={onConfigureAlerts}
              onSeek={setAt}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SheetContent>
  )
}

function alertName(alertId: string) {
  return CONFIGURED_ALERTS.find((item) => item.id === alertId)?.name ?? alertId
}

function CallHeader({
  actions,
  call,
}: {
  actions?: React.ReactNode
  call: CallRow
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2 border-b p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-semibold text-foreground">
              {call.scenario}
            </h2>
            {call.status === "completed" ? (
              <Badge className="bg-success-tint text-success-tint-foreground">
                <CallCompletedIcon />
                completed
              </Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground">
                <VoicemailIcon />
                voicemail
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              {call.direction === "inbound" ? (
                <InboundIcon className="size-3.5" />
              ) : (
                <OutboundIcon className="size-3.5" />
              )}
              {call.phoneNumber}
            </span>
            <Separator className="h-3" orientation="vertical" />
            <span className="flex items-center gap-1">
              <OrganizationIcon className="size-3.5" />
              {OWNER.organization}
            </span>
            <span className="flex items-center gap-1">
              <OwnerIcon className="size-3.5" />
              {OWNER.email}
            </span>
            <span className="flex items-center gap-1">
              <LanguageIcon className="size-3.5" />
              {call.language}
            </span>
            <Separator className="h-3" orientation="vertical" />
            <span>{call.startedAt}</span>
            <span className="tabular-nums">
              {Math.floor(call.duration / 60)}m {call.duration % 60}s
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button size="sm" variant="ghost">
            <CopyCallLinkIcon />
            Link
          </Button>
          <Button size="sm" variant="ghost">
            <CopyIdIcon />
            Call ID
          </Button>
          {actions}
        </div>
      </div>
    </div>
  )
}
