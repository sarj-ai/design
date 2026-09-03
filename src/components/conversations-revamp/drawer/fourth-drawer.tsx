"use client"

import * as React from "react"
import type { PanelImperativeHandle } from "react-resizable-panels"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  CALL_DETAIL,
  CALL_FLAGS,
  ISSUE_TYPE_LABELS,
  ISSUE_TYPE_ORDER,
  type CallIdentity,
  type CallSpecifics,
  type CallState,
  type Channel,
  type IssueType,
} from "@/lib/conversations-revamp-drawer-data"
import { CallHeader } from "@/components/conversations-revamp/drawer/call-shell"
import { PreCallPanel } from "@/components/conversations-revamp/drawer/pre-call-panel"
import { CompletedScheduleSummary } from "@/components/conversations-revamp/drawer/completed-schedule-summary"
import { LinkedCall } from "@/components/conversations-revamp/drawer/linked-call"
import {
  ISSUE_TONE,
  SectionRegister,
} from "@/components/conversations-revamp/drawer/section-register"
import { TranscriptPanel } from "@/components/conversations-revamp/drawer/transcript-views"
import { formatTimeSeconds } from "@/components/conversations-revamp/drawer/recording-player"
import {
  FlagIcon,
  ShowPanelIcon,
} from "@/components/conversations-revamp/drawer/icons"

/**
 * Variant four: the drawer with the review feedback applied.
 *
 * Four changes, and each one is answering something the earlier variants got
 * wrong rather than something they merely lacked:
 *
 *   Transcript  One view, not a choice of views: the enhanced transcription
 *               with every STT mishearing struck through in the line it
 *               happened in. Plus search, since a transcript you cannot search
 *               is a transcript you re-read.
 *   Insights    No success or failure — an insight has a category and no status.
 *               That was factually wrong before, not just unpolished.
 *   Split       A drag handle between the two halves. How much room a transcript
 *               needs against how much the panel needs is a per-reader answer,
 *               so it stops being a number we picked.
 *   Panel       Order and visibility are the reader's, and they are remembered.
 *
 * The drawer width itself stays fixed. Expanding from info to transcript came up
 * in review and was explicitly deferred.
 */
export function FourthDrawer({
  channel = "call",
  onCancelCall,
  onOpenChange,
  open,
  specifics = {},
  state = "complete",
  title,
}: {
  /**
   * Chat sessions open the same drawer minus the three things a chat does not
   * have: a recording, a phone number, and an audio timeline. Everything the
   * panel reports is unchanged.
   */
  channel?: Channel
  /** Confirmed cancellation of the scheduled call this drawer is showing. */
  onCancelCall?: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  /**
   * What is true of the clicked call rather than of the sample: its schedule,
   * and the calls on either side of it. The transcript and recording below
   * stay shared — twelve transcripts is not what this mockup is for — but
   * nothing that tells one row from another should be.
   */
  specifics?: CallSpecifics
  /** The clicked row's own identity, so every row does not open one call. */
  title?: CallIdentity
  /**
   * A queued or scheduled call has no recording, transcript, outcome or
   * collected data, so the split and the panel are not what it needs — it gets
   * the one thing that exists instead.
   */
  state?: CallState
}) {
  const call = CALL_DETAIL
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

  const markers = CALL_FLAGS.map((flag) => ({
    id: flag.id,
    label: ISSUE_TYPE_LABELS[flag.issueType],
    timestampMs: flag.timestampMs,
    tone: ISSUE_TONE[flag.issueType],
  }))

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        /* The drawer is sized to what it has to show. Six columns of width
           exist for a transcript beside a panel; a scheduled call has one card
           and would otherwise sit marooned in the middle of an empty sheet. */
        className={cn(
          "flex w-full flex-col lg:overflow-hidden",
          state === "complete" ? "sm:max-w-6xl!" : "sm:max-w-xl!",
        )}
        /**
         * Without this, touching the resize handle shuts the drawer.
         *
         * The dialog does not decide "was that click outside me?" by asking the
         * DOM. It sets a flag from its own React pointer-down handler, and
         * treats a missing flag as outside. The resize separator listens for
         * pointer-down natively and stops the event there — so React's handler
         * never runs, the flag is never set, and a press on the handle is read
         * as a press on the page behind the drawer.
         *
         * So answer the question the dialog was actually asking: if the press
         * really landed inside this panel, it was not outside. A genuine click
         * on the overlay still closes, and so do Escape and the close button.
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
        <SheetTitle className="sr-only">Call Details</SheetTitle>
        <SheetDescription className="sr-only">
          {call.scenario}, {call.phoneNumber}, {call.startedAt}
        </SheetDescription>

        <div className="flex min-h-0 flex-1 flex-col">
          <CallHeader
            channel={channel}
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
            state={state}
            title={title}
          />

          {/* How much room a transcript needs against how much the panel needs
              min and max sizes are the part that is still ours: without them
              either half can be dragged away to nothing.

              The split resets each time the drawer opens. Unlike the section
              order it is a reading choice for this call, not a standing
              preference, and `defaultLayout` is only read when the group mounts
              — which the drawer does and undoes on every open. */}
          {state !== "complete" ? (
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4">
              <PreCallPanel
                onCancel={() => onCancelCall?.()}
                specifics={specifics}
                state={state}
              />
            </div>
          ) : (
            <>
              {/* A completed call that was booked, or that booked one, says so
                  above the transcript. Buried in the panel beside insights and
                  collected data it reads as one more field; the relationship to
                  another call is the frame for everything under it. */}
              {specifics.ranFrom || specifics.booked ? (
                <div className="flex shrink-0 flex-col gap-2 px-4 pt-4">
                  {specifics.ranFrom ? (
                    <LinkedCall label="Ran from" link={specifics.ranFrom} />
                  ) : null}
                  {specifics.booked ? (
                    <LinkedCall
                      label="Callback booked"
                      link={specifics.booked}
                    />
                  ) : null}
                </div>
              ) : null}

              {specifics.schedule ? (
                <div className="shrink-0 px-4 pt-2">
                  <CompletedScheduleSummary schedule={specifics.schedule} />
                </div>
              ) : null}

              <ResizablePanelGroup
                className="min-h-0 flex-1 p-4"
                orientation="horizontal"
              >
                {/* Sizes are strings on purpose: react-resizable-panels reads a
                bare number as pixels and a string as a percentage.

                `minSize` is now the point a half gives up rather than the point
                it stops shrinking — a collapsible panel dragged under its
                minimum collapses. Neither half caps its width any more, since
                either one has to be able to reach the full drawer. */}
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
                    actions={<FlagDialog at={at} />}
                    at={at}
                    channel={channel}
                    flags={markers}
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
                  <SectionRegister onSeek={setAt} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

const COMMENT_LIMIT = 1000

/**
 * Flagging an issue, as the app does it.
 *
 * It lives beside the player rather than in the header because a flag is
 * anchored to a millisecond in the recording, not to the call as a whole — which
 * is also why a call carries several and why this creates rather than toggles.
 */
function FlagDialog({ at }: { at: number }) {
  const [open, setOpen] = React.useState(false)
  const [issueType, setIssueType] = React.useState<IssueType | "">("")
  const [comment, setComment] = React.useState("")

  function close() {
    setOpen(false)
    setIssueType("")
    setComment("")
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (next) setOpen(true)
        else close()
      }}
      open={open}
    >
      <DialogTrigger asChild>
        {/* Ghost, like everything else on the transport row — an outline
            button in there reads as the one thing you are meant to press. */}
        <Button size="sm" variant="ghost">
          <FlagIcon />
          Flag Issue
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Flag Call Issue</DialogTitle>
          <DialogDescription>
            Report an issue with this call at {formatTimeSeconds(at)}.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="flag-issue-type">Issue type</FieldLabel>
          <Select
            onValueChange={(value) => {
              setIssueType(value as IssueType)
            }}
            value={issueType}
          >
            <SelectTrigger id="flag-issue-type">
              <SelectValue placeholder="Select an issue type" />
            </SelectTrigger>
            <SelectContent>
              {ISSUE_TYPE_ORDER.map((type) => (
                <SelectItem key={type} value={type}>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn("size-2 rounded-4xl", ISSUE_TONE[type])}
                    />
                    {ISSUE_TYPE_LABELS[type]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="flag-comment">Comment</FieldLabel>
          <Textarea
            id="flag-comment"
            maxLength={COMMENT_LIMIT}
            onChange={(event) => {
              setComment(event.target.value)
            }}
            placeholder="What went wrong at this moment?"
            rows={4}
            value={comment}
          />
          <span className="text-xs text-muted-foreground tabular-nums">
            {comment.length} / {COMMENT_LIMIT}
          </span>
        </Field>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button disabled={!issueType} onClick={close}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
