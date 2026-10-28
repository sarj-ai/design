"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { ToggleFilter } from "@/components/shared/filter-bar"
import { CallDrawer } from "@/components/mockups/review-tracking/call-drawer"
import { ConversationsFrame } from "@/components/mockups/review-tracking/conversations-frame"
import {
  MarkReviewedIcon,
  ReviewModeIcon,
  StartReviewIcon,
} from "@/components/mockups/review-tracking/icons"
import {
  ReviewedButton,
  reviewedColumn,
  SaveButton,
  savedColumn,
} from "@/components/mockups/review-tracking/list-ideas"
import { ReviewTable } from "@/components/mockups/review-tracking/review-table"
import type { CallRow } from "@/lib/mockups/conversations-revamp-list-data"
import {
  REVIEW_CALLS,
  REVIEWED,
  SAVED,
} from "@/lib/mockups/review-tracking-data"

function toggleIn(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

export function ReviewModeIdea() {
  const [on, setOn] = React.useState(true)
  const [reviewed, setReviewed] = React.useState<string[]>(REVIEWED)
  const [saved, setSaved] = React.useState<string[]>(SAVED)
  const [notReviewed, setNotReviewed] = React.useState(false)
  const [savedOnly, setSavedOnly] = React.useState(false)
  const [open, setOpen] = React.useState<CallRow | null>(null)

  function markAll(rows: CallRow[]) {
    const before = reviewed
    setReviewed(
      Array.from(new Set([...reviewed, ...rows.map((row) => row.id)])),
    )
    toast(
      `${rows.filter((row) => !before.includes(row.id)).length} calls marked as reviewed`,
      {
        action: { label: "Undo", onClick: () => setReviewed(before) },
      },
    )
  }

  return (
    <ConversationsFrame
      above={
        on
          ? (rows: CallRow[]) => {
              const done = rows.filter((row) =>
                reviewed.includes(row.id),
              ).length
              return (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {done} of {rows.length} reviewed
                  </span>
                  {done < rows.length ? (
                    <Button
                      onClick={() => markAll(rows)}
                      size="sm"
                      variant="outline"
                    >
                      Mark all as reviewed
                    </Button>
                  ) : null}
                </div>
              )
            }
          : null
      }
      calls={REVIEW_CALLS}
      extraActive={on ? [notReviewed, savedOnly].filter(Boolean).length : 0}
      filterExtras={
        on ? (
          <>
            <ToggleFilter
              field="Not reviewed"
              onChange={setNotReviewed}
              value={notReviewed}
            />
            <ToggleFilter
              field="Saved"
              onChange={setSavedOnly}
              value={savedOnly}
            />
          </>
        ) : null
      }
      narrow={(rows) =>
        on
          ? rows.filter(
              (call) =>
                (!notReviewed || !reviewed.includes(call.id)) &&
                (!savedOnly || saved.includes(call.id)),
            )
          : rows
      }
      onClearExtras={() => {
        setNotReviewed(false)
        setSavedOnly(false)
      }}
      searchExtras={
        <Toggle
          onPressedChange={(pressed) => {
            setOn(pressed)
            if (!pressed) {
              setNotReviewed(false)
              setSavedOnly(false)
            }
          }}
          pressed={on}
          variant="outline"
        >
          <ReviewModeIcon />
          Review
        </Toggle>
      }
    >
      {(rows) => (
        <>
          <ReviewTable
            after={on ? [savedColumn(saved, setSaved)] : []}
            before={on ? [reviewedColumn(reviewed, setReviewed)] : []}
            calls={rows}
            onOpen={setOpen}
          />
          <CallDrawer
            actions={
              on && open ? (
                <>
                  <SaveButton
                    onToggle={() => setSaved((list) => toggleIn(list, open.id))}
                    saved={saved.includes(open.id)}
                  />
                  <ReviewedButton
                    onToggle={() =>
                      setReviewed((list) => toggleIn(list, open.id))
                    }
                    reviewed={reviewed.includes(open.id)}
                  />
                </>
              ) : null
            }
            call={open}
            calls={rows}
            onClose={() => setOpen(null)}
            onStep={setOpen}
          />
        </>
      )}
    </ConversationsFrame>
  )
}

type Session = { ids: string[]; done: string[] }

export function SessionIdea() {
  const [session, setSession] = React.useState<Session | null>(null)
  const [open, setOpen] = React.useState<CallRow | null>(null)

  const queue = session
    ? session.ids.flatMap((id) => REVIEW_CALLS.filter((call) => call.id === id))
    : []
  const nextUp = session
    ? (queue.find((call) => !session.done.includes(call.id)) ?? null)
    : null

  function start(rows: CallRow[]) {
    setSession({ ids: rows.map((row) => row.id), done: [] })
    setOpen(rows[0])
  }

  function end(current: Session) {
    setSession(null)
    setOpen(null)
    toast("Review ended", {
      description: `${current.done.length} of ${current.ids.length} calls reviewed.`,
      action: { label: "Undo", onClick: () => setSession(current) },
    })
  }

  function advance(call: CallRow) {
    if (!session) return
    const done = session.done.includes(call.id)
      ? session.done
      : [...session.done, call.id]
    const updated = { ...session, done }
    const index = queue.findIndex((item) => item.id === call.id)
    const following =
      queue.slice(index + 1).find((item) => !done.includes(item.id)) ??
      queue.find((item) => !done.includes(item.id))
    if (!following) {
      setSession(null)
      setOpen(null)
      toast.success("Review finished", {
        description: `${done.length} of ${updated.ids.length} calls reviewed.`,
      })
      return
    }
    setSession(updated)
    setOpen(following)
  }

  return (
    <ConversationsFrame
      above={
        session && !open ? (
          <Alert>
            <AlertTitle>Review in progress</AlertTitle>
            <AlertDescription className="tabular-nums">
              {session.done.length} of {session.ids.length} reviewed
            </AlertDescription>
            <AlertAction className="flex gap-2">
              <Button onClick={() => end(session)} size="sm" variant="outline">
                End review
              </Button>
              <Button onClick={() => setOpen(nextUp)} size="sm">
                Continue
              </Button>
            </AlertAction>
          </Alert>
        ) : null
      }
      calls={REVIEW_CALLS}
      narrow={(rows) => (session ? queue : rows)}
      searchExtras={(rows: CallRow[]) =>
        !session && rows.length > 0 ? (
          <Button onClick={() => start(rows)}>
            <StartReviewIcon />
            Start review
          </Button>
        ) : null
      }
    >
      {(rows) => (
        <>
          <ReviewTable
            calls={rows}
            onOpen={setOpen}
            selected={session ? nextUp?.id : null}
            timeMark={
              session
                ? (call) =>
                    session.done.includes(call.id) ? (
                      <span className="flex">
                        <MarkReviewedIcon className="size-3.5 text-success" />
                        <span className="sr-only">Reviewed</span>
                      </span>
                    ) : null
                : undefined
            }
          />
          <CallDrawer
            actions={
              session && open ? (
                <SessionButton
                  done={session.done.includes(open.id)}
                  last={
                    queue.filter(
                      (call) =>
                        call.id !== open.id && !session.done.includes(call.id),
                    ).length === 0
                  }
                  onClick={() => advance(open)}
                />
              ) : null
            }
            call={open}
            calls={rows}
            description={
              session && open
                ? `Reviewing ${queue.findIndex((call) => call.id === open.id) + 1} of ${queue.length} · ${session.done.length} done`
                : undefined
            }
            onClose={() => setOpen(null)}
            onStep={setOpen}
          />
        </>
      )}
    </ConversationsFrame>
  )
}

function SessionButton({
  done,
  last,
  onClick,
}: {
  done: boolean
  last: boolean
  onClick: () => void
}) {
  return (
    <Button onClick={onClick}>
      {done
        ? last
          ? "Finish"
          : "Next"
        : last
          ? "Mark reviewed and finish"
          : "Mark reviewed and next"}
    </Button>
  )
}
