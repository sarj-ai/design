"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { ConversationsPage } from "@/components/mockups/conversations-revamp/list/conversations-page"

export default function ConversationsRevampPage() {
  return (
    <MockupShell
      eyebrow="Monitor · Conversations"
      title="Conversations with the revamped call drawer"
    >
      <ConversationsPage />
    </MockupShell>
  )
}
