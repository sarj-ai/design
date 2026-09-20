"use client"

import { GooMenu } from "@/components/site/goo-menu"
import { useCopy } from "@/components/site/use-copy"
import { INSTALL_COMMANDS, registryUrl } from "@/lib/site/registry"
import { RegistryIcon } from "@/components/shell/workspace-icons"

/**
 * The install command for one mockup, ready to paste into another repo.
 *
 * Every mockup here is published as a shadcn registry item, so taking one is
 * a command rather than a copy-paste of a dozen files. The menu carries all
 * four package managers because the repo it lands in is not this one. Four
 * short words, so two columns of narrow drops.
 */
export function RegistryMenu({ slug, title }: { slug: string; title: string }) {
  const { copied, copy } = useCopy()
  const url = registryUrl(slug)

  return (
    <GooMenu
      label={`Install commands for ${title}`}
      menuLabel="Install commands"
      icon={<RegistryIcon />}
      copiedId={copied}
      items={INSTALL_COMMANDS.map((manager) => ({
        id: manager.id,
        label: manager.label,
        onSelect: () =>
          copy(
            manager.id,
            manager.command(url),
            `${manager.label} command`,
            title,
          ),
      }))}
    />
  )
}
