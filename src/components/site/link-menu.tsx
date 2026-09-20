"use client"

import { GooMenu } from "@/components/site/goo-menu"
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
 * The mockup's own link leads, then a drop per ticket. Three columns of wider
 * drops, because a ticket ID is longer than a package manager's name and a
 * card can answer four tickets.
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
  const { copied, copy } = useCopy()
  const page = mockupUrl(slug)

  return (
    <GooMenu
      label={`Copy links for ${title}`}
      menuLabel="Copy links"
      icon={<ShareLinkIcon />}
      copiedId={copied}
      cols={3}
      dropWidth={64}
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
