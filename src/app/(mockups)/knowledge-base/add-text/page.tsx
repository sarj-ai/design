"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { SOURCES } from "@/lib/mockups/knowledge-base-data"
import { KnowledgeBaseDetail } from "@/components/mockups/knowledge-base/knowledge-base-detail"

/** The Add text dialog, open. */
export default function KnowledgeBaseAddTextPage() {
  return (
    <MockupShell
      eyebrow="Build · Knowledge Bases"
      title="Knowledge base — adding text"
    >
      <KnowledgeBaseDetail initialSources={SOURCES} initialDialog="text" />
    </MockupShell>
  )
}
