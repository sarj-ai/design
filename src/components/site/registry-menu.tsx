"use client"

import { CopyMenu } from "@/components/site/copy-menu"
import { useCopy } from "@/components/site/use-copy"
import { INSTALL_COMMANDS, registryUrl } from "@/lib/site/registry"
import { RegistryIcon } from "@/components/shell/workspace-icons"

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
