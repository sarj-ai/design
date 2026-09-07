"use client"

import { MockupShell } from "@/components/mockup-shell"
import { SOURCES } from "@/lib/knowledge-base-data"
import { KnowledgeBaseDetail } from "@/components/knowledge-base/knowledge-base-detail"

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
