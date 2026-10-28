"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleFilter } from "@/components/shared/filter-bar"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import { CallDrawer } from "@/components/mockups/review-tracking/call-drawer"
import { ConversationsFrame } from "@/components/mockups/review-tracking/conversations-frame"
import {
  MarkReviewedIcon,
  SaveForLaterIcon,
} from "@/components/mockups/review-tracking/icons"
import { ReviewTable } from "@/components/mockups/review-tracking/review-table"
import type { CallRow } from "@/lib/mockups/conversations-revamp-list-data"
import {
  HISTORY,
  LAST_OPENED,
  OPENED,
  REVIEW_CALLS,
  REVIEWED,
  SAVED,
} from "@/lib/mockups/review-tracking-data"
import { cn } from "@/lib/utils"

/** The open call, and the rows its arrows walk. */
function useOpenCall(onOpen?: (call: CallRow) => void) {
  const [open, setOpen] = React.useState<CallRow | null>(null)
  const show = React.useCallback(
    (call: CallRow) => {
      setOpen(call)
      onOpen?.(call)
    },
    [onOpen],
  )
  return { open, show, close: () => setOpen(null) }
}

function toggleIn(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

/* ------------------------------------------------------------ row numbers */

/**
 * Mohammed's first ask: a number per row, so "I'm on the 15th" is something
 * you can remember. It counts the list as filtered and sorted — row 15 is
 * the fifteenth call on screen, not a property of the call — so it holds
 * only until the list changes under you.
 */
export function RowNumbersIdea() {
  const { open, show, close } = useOpenCall()

  return (
    <ConversationsFrame calls={REVIEW_CALLS}>
      {(rows) => (
        <>
          <ReviewTable
            before={[
              {
                id: "number",
                head: "#",
                className: "w-12 text-muted-foreground tabular-nums",
                cell: (_, index) => index + 1,
              },
            ]}
            calls={rows}
            onOpen={show}
          />
          <CallDrawer
            call={open}
            calls={rows}
            description={
              open
                ? `#${rows.findIndex((row) => row.id === open.id) + 1} · ${open.phoneNumber} · ${open.scenario}`
                : undefined
            }
            onClose={close}
            onStep={show}
          />
        </>
      )}
    </ConversationsFrame>
  )
}

/* ------------------------------------------------------------ last opened */

/**
 * Maryam's and Hasan's: the row you opened last stays shaded after the
 * drawer closes, so coming back to the list you land where you left off.
 * Walking with ↑ ↓ in the drawer moves the shade with you. It remembers one
 * call, per person, and asks nothing of the reviewer.
 */
export function LastOpenedIdea() {
  const [last, setLast] = React.useState<string | null>(LAST_OPENED)
  const { open, show, close } = useOpenCall(
    React.useCallback((call: CallRow) => setLast(call.id), []),
  )

  return (
    <ConversationsFrame calls={REVIEW_CALLS}>
      {(rows) => (
        <>
          <ReviewTable calls={rows} onOpen={show} selected={last} />
          <CallDrawer call={open} calls={rows} onClose={close} onStep={show} />
        </>
      )}
    </ConversationsFrame>
  )
}

/* ----------------------------------------------------------------- unread */

/**
 * Vansh's dot, with Maryam's way out of it: a call you have never opened
 * carries a dot and a full-strength time, as an unread email does; opening
 * it clears both. "Unread only" narrows the list to what is left, and Mark
 * all as read clears the lot — so the dots never become a chore of clicking
 * through every call. The button is absent once nothing is unread.
 */
export function UnreadIdea() {
  const [opened, setOpened] = React.useState<string[]>(OPENED)
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const { open, show, close } = useOpenCall(
    React.useCallback(
      (call: CallRow) =>
        setOpened((list) =>
          list.includes(call.id) ? list : [...list, call.id],
        ),
      [],
    ),
  )
  const unread = (call: CallRow) => !opened.includes(call.id)
  const unreadCount = REVIEW_CALLS.filter(unread).length

  function markAllRead() {
    const before = opened
    setOpened(REVIEW_CALLS.map((call) => call.id))
    toast(`${unreadCount} calls marked as read`, {
      action: { label: "Undo", onClick: () => setOpened(before) },
    })
  }

  return (
    <ConversationsFrame
      calls={REVIEW_CALLS}
      extraActive={unreadOnly ? 1 : 0}
      filterExtras={
        <ToggleFilter
          field="Unread only"
          onChange={setUnreadOnly}
          value={unreadOnly}
        />
      }
      narrow={(rows) => (unreadOnly ? rows.filter(unread) : rows)}
      onClearExtras={() => setUnreadOnly(false)}
      searchExtras={
        unreadCount > 0 ? (
          <Button onClick={markAllRead} variant="outline">
            Mark all as read
          </Button>
        ) : null
      }
    >
      {(rows) => (
        <>
          <ReviewTable
            calls={rows}
            onOpen={show}
            timeMark={(call) =>
              unread(call) ? (
                <span className="size-2 rounded-full bg-primary">
                  <span className="sr-only">Unread</span>
                </span>
              ) : null
            }
            timeStrong={unread}
          />
          <CallDrawer call={open} calls={rows} onClose={close} onStep={show} />
        </>
      )}
    </ConversationsFrame>
  )
}

/* --------------------------------------------------------------- reviewed */

/**
 * Vansh's checkbox: the reviewer ticks a call once they are done with it.
 * Opening is not reviewing — Hasan's point — so the tick is a deliberate
 * act, from the row or from the drawer. "Not reviewed" narrows the list to
 * what is left.
 */
export function ReviewedIdea() {
  const [reviewed, setReviewed] = React.useState<string[]>(REVIEWED)
  const [notReviewed, setNotReviewed] = React.useState(false)
  const { open, show, close } = useOpenCall()

  return (
    <ConversationsFrame
      calls={REVIEW_CALLS}
      extraActive={notReviewed ? 1 : 0}
      filterExtras={
        <ToggleFilter
          field="Not reviewed"
          onChange={setNotReviewed}
          value={notReviewed}
        />
      }
      narrow={(rows) =>
        notReviewed ? rows.filter((call) => !reviewed.includes(call.id)) : rows
      }
      onClearExtras={() => setNotReviewed(false)}
    >
      {(rows) => (
        <>
          <ReviewTable
            before={[reviewedColumn(reviewed, setReviewed)]}
            calls={rows}
            onOpen={show}
          />
          <CallDrawer
            actions={
              open ? (
                <ReviewedButton
                  onToggle={() =>
                    setReviewed((list) => toggleIn(list, open.id))
                  }
                  reviewed={reviewed.includes(open.id)}
                />
              ) : null
            }
            call={open}
            calls={rows}
            onClose={close}
            onStep={show}
          />
        </>
      )}
    </ConversationsFrame>
  )
}

export function reviewedColumn(
  reviewed: string[],
  setReviewed: React.Dispatch<React.SetStateAction<string[]>>,
) {
  return {
    id: "reviewed",
    head: <span className="sr-only">Reviewed</span>,
    className: "w-10",
    cell: (call: CallRow) => (
      <Checkbox
        aria-label={`Reviewed ${call.createdAt}`}
        checked={reviewed.includes(call.id)}
        className="flex"
        onCheckedChange={() => setReviewed((list) => toggleIn(list, call.id))}
      />
    ),
  }
}

export function ReviewedButton({
  reviewed,
  onToggle,
}: {
  reviewed: boolean
  onToggle: () => void
}) {
  return (
    <Button aria-pressed={reviewed} onClick={onToggle} variant="outline">
      <MarkReviewedIcon className={cn(reviewed && "text-success")} />
      {reviewed ? "Reviewed" : "Mark reviewed"}
    </Button>
  )
}

/* ------------------------------------------------------------------ saved */

/**
 * Kidus's bookmark, which Abdulrahman likened to Slack's save for later:
 * keep a call to come back to, per person. The bookmark sits at the end of
 * the row and in the drawer, filled once saved. "Saved" narrows the list to
 * your saved calls.
 */
export function SavedIdea() {
  const [saved, setSaved] = React.useState<string[]>(SAVED)
  const [savedOnly, setSavedOnly] = React.useState(false)
  const { open, show, close } = useOpenCall()

  return (
    <ConversationsFrame
      calls={REVIEW_CALLS}
      extraActive={savedOnly ? 1 : 0}
      filterExtras={
        <ToggleFilter field="Saved" onChange={setSavedOnly} value={savedOnly} />
      }
      narrow={(rows) =>
        savedOnly ? rows.filter((call) => saved.includes(call.id)) : rows
      }
      onClearExtras={() => setSavedOnly(false)}
    >
      {(rows) => (
        <>
          <ReviewTable
            after={[savedColumn(saved, setSaved)]}
            calls={rows}
            onOpen={show}
          />
          <CallDrawer
            actions={
              open ? (
                <SaveButton
                  onToggle={() => setSaved((list) => toggleIn(list, open.id))}
                  saved={saved.includes(open.id)}
                />
              ) : null
            }
            call={open}
            calls={rows}
            onClose={close}
            onStep={show}
          />
        </>
      )}
    </ConversationsFrame>
  )
}

export function savedColumn(
  saved: string[],
  setSaved: React.Dispatch<React.SetStateAction<string[]>>,
) {
  return {
    id: "saved",
    head: <span className="sr-only">Saved</span>,
    className: "w-12 py-1.5 text-end",
    cell: (call: CallRow) => {
      const on = saved.includes(call.id)
      return (
        <Button
          aria-label={on ? "Remove from saved" : "Save for later"}
          aria-pressed={on}
          onClick={() => setSaved((list) => toggleIn(list, call.id))}
          size="icon-sm"
          variant="ghost"
        >
          <SaveForLaterIcon
            className={cn(
              on ? "fill-current text-primary" : "text-muted-foreground",
            )}
          />
        </Button>
      )
    },
  }
}

export function SaveButton({
  saved,
  onToggle,
}: {
  saved: boolean
  onToggle: () => void
}) {
  return (
    <Button aria-pressed={saved} onClick={onToggle} variant="outline">
      <SaveForLaterIcon className={cn(saved && "fill-current text-primary")} />
      {saved ? "Saved" : "Save for later"}
    </Button>
  )
}

/* ---------------------------------------------------------- watch history */

/**
 * Abdulrahman's watch history, as Instagram keeps one: a second view of the
 * page listing the calls you opened, most recent first, with when. Nothing
 * to tick or remember — the page remembers for you. Opening a call from
 * either view puts it at the top of the history.
 */
export function HistoryIdea() {
  const [view, setView] = React.useState("all")
  const [history, setHistory] = React.useState(HISTORY)
  /* Calls opened during this visit to the drawer. They join the history
     when it closes, so the list does not reorder under the arrows. */
  const visited = React.useRef<string[]>([])
  const opener = useOpenCall(
    React.useCallback((call: CallRow) => {
      visited.current = [
        call.id,
        ...visited.current.filter((id) => id !== call.id),
      ]
    }, []),
  )
  const { open, show } = opener
  function close() {
    const seen = visited.current
    visited.current = []
    setHistory((list) => [
      ...seen.map((id) => ({ id, at: "Just now" })),
      ...list.filter((entry) => !seen.includes(entry.id)),
    ])
    opener.close()
  }
  const openedAt = (call: CallRow) =>
    history.find((entry) => entry.id === call.id)?.at

  return (
    <ConversationsFrame
      above={
        <SecondaryTabs
          items={[
            { id: "all", label: "All calls" },
            { id: "history", label: "Recently opened" },
          ]}
          onValueChange={setView}
          value={view}
        >
          {null}
        </SecondaryTabs>
      }
      calls={REVIEW_CALLS}
      narrow={(rows) =>
        view === "history"
          ? history.flatMap((entry) =>
              rows.filter((row) => row.id === entry.id),
            )
          : rows
      }
    >
      {(rows) => (
        <>
          <ReviewTable
            before={
              view === "history"
                ? [
                    {
                      id: "opened",
                      head: "Opened",
                      className: "text-sm text-muted-foreground tabular-nums",
                      cell: (call) => openedAt(call),
                    },
                  ]
                : []
            }
            calls={rows}
            onOpen={show}
          />
          <CallDrawer call={open} calls={rows} onClose={close} onStep={show} />
        </>
      )}
    </ConversationsFrame>
  )
}
