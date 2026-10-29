"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ElevenLabsIdea,
  IntercomIdea,
  VapiIdea,
} from "@/components/mockups/review-tracking/competitor-ideas"
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
import {
  COMPETITORS,
  IDEAS,
  type IdeaId,
} from "@/lib/mockups/review-tracking-data"

const VIEWS: Record<IdeaId, () => React.ReactNode> = {
  "row-numbers": RowNumbersIdea,
  "last-opened": LastOpenedIdea,
  unread: UnreadIdea,
  reviewed: ReviewedIdea,
  saved: SavedIdea,
  history: HistoryIdea,
  "review-mode": ReviewModeIdea,
  session: SessionIdea,
  elevenlabs: ElevenLabsIdea,
  vapi: VapiIdea,
  intercom: IntercomIdea,
}

export default function ReviewTrackingPage() {
  const [idea, setIdea] = React.useState<IdeaId>("last-opened")
  const View = VIEWS[idea]

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
            <SelectGroup>
              <SelectLabel>Ideas</SelectLabel>
              {IDEAS.map((entry, index) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {index + 1}. {entry.label}
                  <span className="text-muted-foreground">{entry.from}</span>
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>How competitors do it</SelectLabel>
              {COMPETITORS.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                  <span className="text-muted-foreground">{entry.from}</span>
                </SelectItem>
              ))}
            </SelectGroup>
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
