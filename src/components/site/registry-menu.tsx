"use client"

import { CopyMenu } from "@/components/site/copy-menu"
import { useCopy } from "@/components/site/use-copy"
import { INSTALL_COMMANDS, registryUrl } from "@/lib/site/registry"
import { RegistryIcon } from "@/components/shell/workspace-icons"

/**
 * The install command for one mockup, ready to paste into another repo.
 *
 * Every mockup here is published as a shadcn registry item, so taking one is
 * a command rather than a copy-paste of a dozen files. The menu carries all
 * four package managers because the repo it lands in is not this one.
 */
export function RegistryMenu({
  slug,
  title,
  tour,
}: {
  slug: string
  title: string
  /** Set on the first card only — see `hey-click.tsx`. */
  tour?: string
}) {
  const { copy } = useCopy()
  const url = registryUrl(slug)

  return (
    <CopyMenu
      label={`Install commands for ${title}`}
      menuLabel="Install commands"
      icon={<RegistryIcon />}
      tour={tour}
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
