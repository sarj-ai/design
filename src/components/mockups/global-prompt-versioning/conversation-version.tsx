"use client";

import { HistoryIcon } from "@/components/mockups/global-prompt-versioning/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CONVERSATION } from "@/lib/mockups/global-prompt-versioning-data";

export function ConversationVersion({
  onOpenVersion,
}: {
  onOpenVersion: (n: number) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-8">
      <Card>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold">
              {CONVERSATION.scenario}
            </h2>
            <Badge className="tabular-nums" variant="outline">
              v{CONVERSATION.scenarioVersion}
            </Badge>
            <Button
              aria-label={`Open global prompt v${String(CONVERSATION.globalVersion)} in version history`}
              className="tabular-nums"
              onClick={() => onOpenVersion(CONVERSATION.globalVersion)}
              size="xs"
              variant="outline"
            >
              <HistoryIcon />
              Global prompt v{CONVERSATION.globalVersion}
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
  );
}
