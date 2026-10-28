"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HistoryIdea,
  LastOpenedIdea,
  ReviewedIdea,
  RowNumbersIdea,
  SavedIdea,
  UnreadIdea,
} from "@/components/mockups/review-tracking/list-ideas"
import {
  ReviewModeIdea,
  SessionIdea,
} from "@/components/mockups/review-tracking/review-ideas"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import { IDEAS, type IdeaId } from "@/lib/mockups/review-tracking-data"

/**
 * Keeping your place in conversation review — INT-287.
 *
 * Every idea from the Slack thread that raised the ticket, each drawn on the
 * Conversations page as it ships after the index revamp, so they can be put
 * in front of the reviewers who will use them (Abdulrahman's ask). The
 * select in the bar picks the idea; it names who suggested it.
 *
 * Each idea is a real, clickable version: rows open the call drawer, ↑ ↓
 * walk the list, and whatever an idea remembers (last opened, read, ticked,
 * saved, history, a session) changes as you use it.
 */

const VIEWS: Record<IdeaId, () => React.ReactNode> = {
  "row-numbers": RowNumbersIdea,
  "last-opened": LastOpenedIdea,
  unread: UnreadIdea,
  reviewed: ReviewedIdea,
  saved: SavedIdea,
  history: HistoryIdea,
  "review-mode": ReviewModeIdea,
  session: SessionIdea,
}

export default function ReviewTrackingPage() {
  const [idea, setIdea] = React.useState<IdeaId>("last-opened")
  const View = VIEWS[idea]

  /* A toast belongs to the idea that raised it. */
  React.useEffect(() => {
    toast.dismiss()
  }, [idea])

  return (
    <MockupShell
      actions={
        <Select
          onValueChange={(value) => setIdea(value as IdeaId)}
          value={idea}
        >
          <SelectTrigger aria-label="Idea" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {IDEAS.map((entry, index) => (
              <SelectItem key={entry.id} value={entry.id}>
                {index + 1}. {entry.label}
                <span className="text-muted-foreground">{entry.from}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      title="Keeping your place in conversation review"
    >
      <AppShell active="Conversations">
        {/* Keyed so each idea opens as the page would find it. */}
        <View key={idea} />
      </AppShell>
    </MockupShell>
  )
}
