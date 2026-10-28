"use client"

import { CopyMenu } from "@/components/site/copy-menu"
import { useCopy } from "@/components/site/use-copy"
import { linearIssueUrl } from "@/lib/site/linear"
import { mockupUrl } from "@/lib/site/registry"
import { ShareLinkIcon } from "@/components/shell/workspace-icons"

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
