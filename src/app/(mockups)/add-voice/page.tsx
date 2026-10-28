"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { AddVoiceDialog } from "@/components/mockups/add-voice/add-voice-dialog"

export default function AddVoicePage() {
  return (
    <MockupShell
      eyebrow="Platform admin · Voice library"
      title="Add new voice — with a fallback for provider outages"
    >
      <main className="flex min-h-150 w-full items-center justify-center p-8">
        <AddVoiceDialog />
      </main>
    </MockupShell>
  )
}
