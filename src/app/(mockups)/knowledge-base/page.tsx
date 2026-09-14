"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { KnowledgeBaseIndex } from "@/components/mockups/knowledge-base/knowledge-base-index"

export default function KnowledgeBaseIndexPage() {
  return (
    <MockupShell
      eyebrow="Build · Knowledge Bases"
      title="Knowledge bases — the index"
    >
      <KnowledgeBaseIndex />
    </MockupShell>
  )
}
