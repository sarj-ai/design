"use client"

import { MockupShell } from "@/components/mockup-shell"
import { KnowledgeBaseIndex } from "@/components/knowledge-base/knowledge-base-index"

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
