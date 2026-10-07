"use client"

import { CopyMenu } from "@/components/site/copy-menu"
import { useCopy } from "@/components/site/use-copy"
import { linearIssueUrl } from "@/lib/site/linear"
import { mockupUrl } from "@/lib/site/registry"
import { ShareLinkIcon } from "@/components/shell/workspace-icons"

/**
 * Every link this card has, in one place, ready to paste.
 *
 * The two links a reviewer needs are the two they cannot get at: the mockup's
 * published URL — which is not in the address bar, because the index is — and
 * the tickets it answers. Both get pasted into Linear and Slack constantly,
 * and the alternative is opening the page to copy the address, or opening the
 * ticket to copy its address.
 *
 * Ticket chips on the card carry the same links and OPEN them. This menu is
 * the other half of the same job: one is for going there, one is for handing
 * it to someone else.
 *
 * The mockup's own link leads, then one row per ticket.
 */
export function LinkMenu({
  slug,
  tickets,
  title,
}: {
  slug: string
  tickets: string[]
  title: string
}) {
  const { copy } = useCopy()
  const page = mockupUrl(slug)

  return (
    <CopyMenu
      label={`Copy links for ${title}`}
      menuLabel="Copy links"
      icon={<ShareLinkIcon />}
      items={[
        {
          id: "mockup",
          label: "Mockup",
          onSelect: () => copy("mockup", page, "Mockup link", page),
        },
        ...tickets.map((ticket) => ({
          id: ticket,
          label: ticket,
          onSelect: () =>
            copy(
              ticket,
              linearIssueUrl(ticket),
              ticket,
              linearIssueUrl(ticket),
            ),
        })),
      ]}
    />
  )
}
