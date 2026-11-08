"use client";

import { CopyMenu } from "@/components/site/copy-menu";
import { useCopy } from "@/components/site/use-copy";
import { REGISTRY_ORIGIN } from "@/lib/site/registry";
import { ShareLinkIcon } from "@/components/shell/workspace-icons";

/** Share one changelog update: a link that lands on it, or the update as markdown for Slack or Linear. */
export function ChangelogShare({
  id,
  title,
  markdown,
}: {
  id: string;
  title: string;
  markdown: string;
}) {
  const { copy } = useCopy();
  const link = `${REGISTRY_ORIGIN}/changelog#${id}`;

  return (
    <CopyMenu
      icon={<ShareLinkIcon />}
      items={[
        {
          id: "link",
          label: "Link",
          onSelect: () => copy("link", link, "Link", link),
        },
        {
          id: "markdown",
          label: "Markdown",
          onSelect: () =>
            copy("markdown", `${markdown}\n\n${link}`, "Update", title),
        },
      ]}
      label={`Share ${title}`}
      menuLabel="Copy"
    />
  );
}
