"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { EditPersonaDialog } from "@/components/mockups/persona-pronunciation/edit-persona-dialog"

export default function PersonaPronunciationPage() {
  return (
    <MockupShell
      eyebrow="Personas · Edit persona"
      title="Design persona pronunciation UX and voice model split"
    >
      {/* The ticket is the dialog. The page behind it only holds it open, so
          `npm run shots` captures the design rather than an empty route. */}
      <main className="flex min-h-150 w-full items-center justify-center p-8">
        <EditPersonaDialog />
      </main>
    </MockupShell>
  )
}
