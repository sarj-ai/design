"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { FlagCallDialog } from "@/components/mockups/call-flagging/flag-call-dialog"

export default function CallFlaggingPage() {
  return (
    <MockupShell
      eyebrow="Conversations · Call detail"
      title="Design flagging category UI and color system"
    >
      {/* The ticket is the dialog. The page behind it only holds it open, so
          `npm run shots` captures the design rather than an empty route. */}
      <main className="flex min-h-150 w-full items-center justify-center p-8">
        <FlagCallDialog />
      </main>
    </MockupShell>
  )
}
