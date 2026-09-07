"use client"

import { MockupShell } from "@/components/mockup-shell"
import { KnowledgeBaseIndex } from "@/components/knowledge-base/knowledge-base-index"

/** The index with a row's menu open — one link, so the popup can be exported. */
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
