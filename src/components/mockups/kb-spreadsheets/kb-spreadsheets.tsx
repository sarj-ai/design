"use client";

import * as React from "react";

import { KnowledgeBaseDetail } from "@/components/mockups/kb-spreadsheets/knowledge-base-detail";
import { SheetEditor } from "@/components/mockups/kb-spreadsheets/sheet-editor";
import { SOURCES, type Source } from "@/lib/mockups/kb-spreadsheets-data";

export function KbSpreadsheets({
  openId,
  onOpenChange,
}: {
  openId: string | null;
  onOpenChange: (id: string | null) => void;
}) {
  const [sources, setSources] = React.useState<Source[]>(() => [...SOURCES]);
  const open = sources.find((source) => source.id === openId);

  if (open?.sheet && open.tokens !== undefined) {
    return (
      <SheetEditor
        key={open.id}
        source={{ ...open, sheet: open.sheet, tokens: open.tokens }}
        onBack={() => onOpenChange(null)}
        onSave={(sheet, tokens) =>
          setSources((current) =>
            current.map((source) =>
              source.id === open.id
                ? { ...source, sheet, tokens, addedAt: "Just now" }
                : source,
            ),
          )
        }
      />
    );
  }

  return (
    <KnowledgeBaseDetail
      sources={sources}
      setSources={setSources}
      onOpenSheet={onOpenChange}
    />
  );
}
