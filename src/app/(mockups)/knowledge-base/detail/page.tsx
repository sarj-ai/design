"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { SOURCES } from "@/lib/mockups/knowledge-base-data"
import { KnowledgeBaseDetail } from "@/components/mockups/knowledge-base/knowledge-base-detail"

export default function KnowledgeBaseDetailPage() {
  return (
    <MockupShell
      eyebrow="Build · Knowledge Bases"
      title="Knowledge base — with content"
    >
      <KnowledgeBaseDetail initialSources={SOURCES} />
    </MockupShell>
  )
}
