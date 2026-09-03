"use client"

import { Badge } from "@/components/ui/badge"
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

import { ConfigureIcon, FillerWordsIcon, ListenerCuesIcon } from "./icons"

/**
 * The two backchannel capabilities, side by side and deliberately separate.
 *
 * They read as one pair because both are the agent acknowledging the caller,
 * but they run at different points in the turn and share no runtime rules — so
 * they get a switch each, and only listener cues carry a configuration of their
 * own. Putting them in one row with a single switch would be the design mistake
 * this ticket exists to avoid.
 */
export function BackchannelSettings({
  fillerWords,
  listenerCues,
  onConfigure,
  onFillerWordsChange,
  onListenerCuesChange,
}: {
  fillerWords: boolean
  listenerCues: boolean
  onConfigure: () => void
  onFillerWordsChange: (enabled: boolean) => void
  onListenerCuesChange: (enabled: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <FillerWordsIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Filler words</ItemTitle>
          <ItemDescription>
            Use conversational filler words like &ldquo;hmm&rdquo; or &ldquo;I
            see&rdquo; once the caller has finished.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Switch
            aria-label="Filler words"
            checked={fillerWords}
            onCheckedChange={onFillerWordsChange}
          />
        </ItemActions>
      </Item>

      <Item variant="outline">
        <ItemMedia variant="icon">
          <ListenerCuesIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            Listener cues
            <Badge variant="secondary">New</Badge>
          </ItemTitle>
          <ItemDescription>
            Play short acknowledgments while the caller is still speaking.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          {/* Nothing to configure until the capability is on, and the panel
              would otherwise open onto controls that change no call. */}
          {listenerCues ? (
            <Button onClick={onConfigure} size="sm" variant="outline">
              <ConfigureIcon />
              Configure
            </Button>
          ) : null}
          <Switch
            aria-label="Listener cues"
            checked={listenerCues}
            onCheckedChange={onListenerCuesChange}
          />
        </ItemActions>
      </Item>
    </div>
  )
}
