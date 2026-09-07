"use client"

import { MockupShell } from "@/components/mockup-shell"
import { SOURCES } from "@/lib/knowledge-base-data"
import { KnowledgeBaseDetail } from "@/components/knowledge-base/knowledge-base-detail"

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
