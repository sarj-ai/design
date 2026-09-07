"use client"

import { MockupShell } from "@/components/mockup-shell"
import { ConversationsPage } from "@/components/conversations-revamp/list/conversations-page"

/**
 * The two halves joined: the Conversations page as it ships, and the revamped
 * call drawer behind its rows.
 *
 * The drawer had been living on a page of its own next to three earlier
 * variants, which is the wrong thing to review — it is read after a row is
 * clicked, at the width the list leaves it, with the filters still behind it.
 * Only revamp 4 comes across; the variants it was being compared against stay
 * on the old mockup.
 */
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
