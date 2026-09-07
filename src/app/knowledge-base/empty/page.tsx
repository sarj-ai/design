"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { MockupShell } from "@/components/mockup-shell"
import { NEW_KNOWLEDGE_BASE } from "@/lib/knowledge-base-data"
import { KnowledgeBaseDetail } from "@/components/knowledge-base/knowledge-base-detail"

export default function KnowledgeBaseEmptyPage() {
  return (
    <MockupShell
      eyebrow="Build · Knowledge Bases"
      title="Knowledge base — nothing added yet"
    >
      <React.Suspense>
        <JustCreated />
      </React.Suspense>
    </MockupShell>
  )
}

/**
 * The knowledge base the create dialog just made, carrying the name that was
 * typed into it. Opened directly, it is simply an unnamed one.
 */
function JustCreated() {
  const name = useSearchParams().get("name")?.trim()

  return (
    <KnowledgeBaseDetail
      base={name ? { ...NEW_KNOWLEDGE_BASE, name } : NEW_KNOWLEDGE_BASE}
      initialSources={[]}
    />
  )
}
