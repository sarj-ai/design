"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { KnowledgeBaseIndex } from "@/components/mockups/knowledge-base/knowledge-base-index"

export default function KnowledgeBaseRowMenuPage() {
  return (
    <MockupShell
      eyebrow="Build · Knowledge Bases"
      title="Knowledge bases — row menu"
    >
      <KnowledgeBaseIndex initialRowMenu />
    </MockupShell>
  )
}
