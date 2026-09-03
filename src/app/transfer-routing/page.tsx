"use client"

import { MockupShell } from "@/components/mockup-shell"
import { TransferToolDrawer } from "@/components/transfer-routing/transfer-tool-drawer"

export default function TransferRoutingPage() {
  return (
    <MockupShell
      eyebrow="Scenario · Tools"
      title="Transfer tool — multiple routing options"
    >
      {/* The ticket is the drawer. The page behind it is only what opens it. */}
      <main className="flex min-h-150 w-full items-center justify-center p-8">
        <TransferToolDrawer />
      </main>
    </MockupShell>
  )
}
