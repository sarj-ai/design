"use client"

import { MockupShell } from "@/components/mockup-shell"
import { KnowledgeBaseIndex } from "@/components/knowledge-base/knowledge-base-index"

/** The index with the create dialog open — what New Knowledge Base opens. */
export default function KnowledgeBaseNewPage() {
  return (
    <MockupShell
      eyebrow="Build · Knowledge Bases"
      title="Knowledge bases — creating one"
    >
      <KnowledgeBaseIndex initialCreate />
    </MockupShell>
  )
}
