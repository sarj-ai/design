"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HistoryIcon } from "@/components/mockups/config-versioning/icons"
import { CONVERSATION } from "@/lib/mockups/config-versioning-data"

/**
 * The top of a conversation's details, with the one thing versioning adds:
 * the version the call ran with, beside the scenario's name (TDD 3.8). It
 * opens that version in the scenario's history, which is how an engineer
 * gets from a call to the configuration behind it. The conversations list
 * does not show it.
 */
export function ConversationVersion({
  onOpenVersion,
}: {
  onOpenVersion: (n: number) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-8">
      <Card>
        <CardContent className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-semibold">
              {CONVERSATION.scenario}
            </h2>
            <Button
              aria-label={`Open v${CONVERSATION.version} in version history`}
              className="tabular-nums"
              onClick={() => onOpenVersion(CONVERSATION.version)}
              size="xs"
              variant="outline"
            >
              <HistoryIcon />v{CONVERSATION.version}
            </Button>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">
              {CONVERSATION.phoneNumber}
            </span>
            <span aria-hidden>·</span>
            {CONVERSATION.startedAt}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
