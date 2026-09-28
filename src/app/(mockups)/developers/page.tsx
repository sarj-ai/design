"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { DevelopersPage } from "@/components/mockups/developers/developers-page"

export default function DevelopersRoute() {
  return (
    <MockupShell eyebrow="Configuration · Developers" title="Developers">
      <DevelopersPage />
    </MockupShell>
  )
}
