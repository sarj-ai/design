"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { KnowledgeBaseIndex } from "@/components/mockups/knowledge-base/knowledge-base-index"

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
