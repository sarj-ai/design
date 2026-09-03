"use client"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Switch } from "@/components/ui/switch"

import { ConfigureIcon, FillerWordsIcon } from "./icons"

/**
 * The entry point to the drawer this ticket extends.
 *
 * Mappings obey this switch: turning filler words off stops the mapped
 * responses too, so the switch and the Configure button belong on one row
 * rather than the configuration living somewhere the toggle cannot be seen.
 */
export function BackchannelSettings({
  fillerWords,
  onConfigure,
  onFillerWordsChange,
}: {
  fillerWords: boolean
  onConfigure: () => void
  onFillerWordsChange: (enabled: boolean) => void
}) {
  return (
    <Item variant="outline">
      <ItemMedia variant="icon">
        <FillerWordsIcon />
      </ItemMedia>
      <ItemContent>
        {/* Renamed with the drawer it opens. "Filler words" named only half
            of what is behind it, and named it the same as the section inside. */}
        <ItemTitle>Acknowledgments</ItemTitle>
        <ItemDescription>
          Generic filler words, or an exact response for a phrase you map.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {/* Nothing to configure while the capability is off, and the panel
            would otherwise open onto controls that change no call. */}
        {fillerWords ? (
          <Button onClick={onConfigure} size="sm" variant="outline">
            <ConfigureIcon />
            Configure
          </Button>
        ) : null}
        <Switch
          aria-label="Acknowledgments"
          checked={fillerWords}
          onCheckedChange={onFillerWordsChange}
        />
      </ItemActions>
    </Item>
  )
}
