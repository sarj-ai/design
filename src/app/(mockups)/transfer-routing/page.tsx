"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { TransferToolDrawer } from "@/components/mockups/transfer-routing/transfer-tool-drawer"

export default function TransferRoutingPage() {
  return (
    <MockupShell
      eyebrow="Scenario · Tools"
      title="Transfer tool — multiple routing options"
    >
      <main className="flex min-h-150 w-full items-center justify-center p-8">
        <TransferToolDrawer />
      </main>
    </MockupShell>
  )
}
