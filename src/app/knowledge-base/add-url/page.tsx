"use client"

import { MockupShell } from "@/components/mockup-shell"
import { SOURCES } from "@/lib/knowledge-base-data"
import { KnowledgeBaseDetail } from "@/components/knowledge-base/knowledge-base-detail"

/** The Add a URL dialog, open. */
export default function KnowledgeBaseAddUrlPage() {
  return (
    <MockupShell
      eyebrow="Build · Knowledge Bases"
      title="Knowledge base — adding a URL"
    >
      <KnowledgeBaseDetail initialSources={SOURCES} initialDialog="url" />
    </MockupShell>
  )
}
