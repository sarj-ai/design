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
} from "@/lib/behavioral-alerts-data"
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
} from "@/components/behavioral-alerts/icons"
import { SectionRegister } from "@/components/behavioral-alerts/section-register"
import { SEVERITY_RULE } from "@/components/behavioral-alerts/severity"
import {
  TranscriptPanel,
  type Evidence,
} from "@/components/behavioral-alerts/transcript-panel"

/**
 * The call detail in the revamped drawer, with the alert analysis in it.
 *
 * This is the shape the Conversations revamp settled on and not a second draft
 * of it: the header rail, the resizable split, the recording and the panel of
 * reorderable sections all behave the way they do on `/conversations-revamp`.
 * What the PRD adds arrives as two more sections in that panel — User
 * experience and Alerts — rather than as a fifth tab, because the revamp has no
 * tabs left to add one to.
 *
 * The two halves talk to each other, which is the point of putting the analysis
 * here rather than on a tab of its own. Every detection is drawn on the
 * waveform at the second its quote was said, pressing one seeks the recording
 * and scrolls the transcript to that turn, and the turn names the alert it
 * triggered. A detection nobody can find in the call is a detection nobody can
 * check, and checkability is the whole reason the PRD makes evidence mandatory.
 */
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
      {/* Keyed by the call: the playhead, the split and the search box all
          belong to the call being read, not to the drawer. */}
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

  /**
   * Dragging the handle past a half's minimum snaps that half shut rather than
   * stopping at the minimum. Reading a transcript and reading the panel are
   * different jobs, and the reader doing one of them wants the whole drawer for
   * it — a 35% strip of the other is not a compromise, it is two cramped halves.
   *
   * The collapsed half keeps its handle, so it drags back. `hidden` exists so
   * there is also a button for it: a 4px separator against the edge of the
   * sheet is a target you have to know about to find.
   */
  const transcript = React.useRef<PanelImperativeHandle>(null)
  const panel = React.useRef<PanelImperativeHandle>(null)
  const [hidden, setHidden] = React.useState<"none" | "panel" | "transcript">(
    "none",
  )

  const detections = call.analysis.detections

  /** One waveform marker per detection, toned by its severity. */
  const markers = detections.map((detection) => ({
    id: detection.id,
    label: alertName(detection.alertId),
    at: detection.at,
    tone: SEVERITY_RULE[detection.severity],
  }))

  /** What a quoted turn says about itself, keyed by the second it was said. */
  const evidence = new Map<number, Evidence>(
    detections.map((detection) => [
      detection.at,
      { name: alertName(detection.alertId), severity: detection.severity },
    ]),
  )

  return (
    <SheetContent
      className="flex w-full flex-col sm:max-w-6xl! lg:overflow-hidden"
      /**
       * Without this, touching the resize handle shuts the drawer.
       *
       * The dialog does not decide "was that click outside me?" by asking the
       * DOM. It sets a flag from its own React pointer-down handler, and treats
       * a missing flag as outside. The resize separator listens for pointer-down
       * natively and stops the event there — so React's handler never runs, the
       * flag is never set, and a press on the handle is read as a press on the
       * page behind the drawer.
       *
       * So answer the question the dialog was actually asking: if the press
       * really landed inside this panel, it was not outside. A genuine click on
       * the overlay still closes, and so do Escape and the close button.
       */
      onPointerDownOutside={(event) => {
        const target = event.detail.originalEvent.target
        if (target instanceof Node && content.current?.contains(target)) {
          event.preventDefault()
        }
      }}
      ref={content}
      /* The close button sat on top of the Call ID button in the header.
         Escape and a click on the overlay both still shut the drawer. */
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

        {/* Sizes are strings on purpose: react-resizable-panels reads a bare
            number as pixels and a string as a percentage.

            `minSize` is the point a half gives up rather than the point it
            stops shrinking — a collapsible panel dragged under its minimum
            collapses. Neither half caps its width, since either one has to be
            able to reach the full drawer.

            The split resets each time the drawer opens. Unlike the section
            order it is a reading choice for this call, not a standing
            preference. */}
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

/**
 * The metadata that gets read, in one line under the title. The two IDs sit
 * beside it as buttons, the way the revamp has them.
 */
function CallHeader({
  /** Appended after Link and Call ID. Omitted, the header is unchanged. */
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
