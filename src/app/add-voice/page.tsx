"use client"

import { MockupShell } from "@/components/mockup-shell"
import { AddVoiceDialog } from "@/components/add-voice/add-voice-dialog"

export default function AddVoicePage() {
  return (
    <MockupShell
      eyebrow="Platform admin · Voice library"
      title="Add new voice — with a fallback for provider outages"
    >
      {/* The ticket is the dialog. The page behind it only holds it open, so
          `npm run shots` captures the design rather than an empty route. */}
      <main className="flex min-h-150 w-full items-center justify-center p-8">
        <AddVoiceDialog />
      </main>
    </MockupShell>
  )
}
