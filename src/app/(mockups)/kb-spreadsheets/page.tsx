"use client";

import * as React from "react";

import { KbSpreadsheets } from "@/components/mockups/kb-spreadsheets/kb-spreadsheets";
import { ReviewerSwitch } from "@/components/shared/reviewer-switch";
import { MockupShell } from "@/components/shell/mockup-shell";

const VIEWS = [
  { id: "base", label: "Knowledge base", open: null },
  { id: "sheet", label: "Editing a file", open: "src-xlsx-1" },
  { id: "near", label: "Near the limit", open: "src-xlsx-2" },
] as const;

export default function KbSpreadsheetsPage() {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const view = VIEWS.find((entry) => entry.open === openId)?.id ?? "base";

  return (
    <div className="flex h-svh flex-col">
      <MockupShell
        title="Client-maintained knowledge base files"
        actions={
          <ReviewerSwitch
            label="View"
            onChange={(next) => {
              const entry = VIEWS.find((item) => item.id === next);
              if (entry) setOpenId(entry.open);
            }}
            options={VIEWS}
            value={view}
          />
        }
      >
        <KbSpreadsheets openId={openId} onOpenChange={setOpenId} />
      </MockupShell>
    </div>
  );
}
