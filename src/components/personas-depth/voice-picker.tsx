"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  VOICES,
  type PersonaGender,
  type PersonaLanguage,
} from "@/lib/personas-depth-data"
import {
  PlayPreviewIcon,
  SearchIcon,
  StopPreviewIcon,
} from "@/components/personas-depth/icons"

/** Search earns its place once the list is taller than the scroll window. */
const SEARCH_THRESHOLD = 6

/**
 * Whether the viewport still has content below the fold, watched rather than
 * guessed from a row count — a two-column grid means the same number of voices
 * overflows or does not depending on how the rows pack, and the fade has to be
 * right every time or it stops meaning anything. Returns false once the reader
 * reaches the bottom, so the fade clears instead of implying more.
 */
function useHasMoreBelow(shownCount: number) {
  /* Held on the wrapper and queried down, because ScrollArea owns its viewport
     and forwards no ref to it — and `src/components/ui` is regenerated, so it
     is not the place to add one. */
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const [hasMore, setHasMore] = React.useState(false)

  React.useEffect(() => {
    const viewport = wrapperRef.current?.querySelector<HTMLElement>(
      "[data-slot=scroll-area-viewport]",
    )
    if (!viewport) return

    const measure = () => {
      const remaining =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
      /* A pixel of slack: fractional scroll heights would otherwise leave the
         fade on forever at the bottom of the list. */
      setHasMore(remaining > 1)
    }

    measure()
    viewport.addEventListener("scroll", measure, { passive: true })

    const observer = new ResizeObserver(measure)
    observer.observe(viewport)

    return () => {
      viewport.removeEventListener("scroll", measure)
      observer.disconnect()
    }
  }, [shownCount])

  return { hasMore, wrapperRef }
}

/**
 * The voice list a persona picks from — DES-96's shipped behavior: voices are
 * filtered to the persona's language and gender, and every row can be heard
 * before it is chosen. Production combos hold dozens of voices, so this is a
 * dense searchable list in a fixed window, not a card wall.
 */
export function VoicePicker({
  language,
  gender,
  selectedId,
  onSelect,
}: {
  language: PersonaLanguage
  gender: PersonaGender
  selectedId: string
  onSelect: (voiceId: string) => void
}) {
  const [playingId, setPlayingId] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")

  const voices = VOICES.filter(
    (voice) =>
      voice.active && voice.language === language && voice.gender === gender,
  )

  const shown = query
    ? voices.filter((voice) =>
        `${voice.name} ${voice.vibe} ${voice.provider}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : voices

  /* Above the empty-state return: the list length is what the fade re-measures
     on, and a hook cannot sit behind a conditional. */
  const { hasMore, wrapperRef } = useHasMoreBelow(shown.length)

  if (voices.length === 0) {
    return (
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        No {gender.toLowerCase()} {language} voices are available yet. Pick a
        different gender, or ask an admin to add one in the voice library.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Full width, and the only thing in the header. The count line that used
          to sit beside it ("9 male Arabic voices. Tap play to hear a sample.")
          restated the list directly under it, so it cost a row to say what the
          rows already said. */}
      {voices.length > SEARCH_THRESHOLD ? (
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search voices…"
            aria-label="Search voices"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
      ) : null}

      {/* The window height deliberately cuts a row in half, and the fade
          says "keep scrolling" — nobody mistakes the cut for the end. */}
      <div className="relative" ref={wrapperRef}>
        <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-72">
          <div className="grid gap-2 pe-3 pb-6 md:grid-cols-2">
            {shown.length === 0 ? (
              <div className="col-span-full flex flex-col items-center gap-2 rounded-lg bg-muted p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No voices match “{query}”.
                </p>
                <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </div>
            ) : (
              shown.map((voice) => {
                const selected = voice.id === selectedId
                const playing = voice.id === playingId

                return (
                  <div key={voice.id} className="relative">
                    <Item
                      variant="outline"
                      size="sm"
                      asChild
                      className={cn(
                        selected && "border-primary bg-primary-tint/40",
                      )}
                    >
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelect(voice.id)}
                        className={cn(
                          "w-full text-start",
                          !selected && "hover:bg-muted",
                        )}
                      >
                        <ItemContent>
                          <ItemTitle>{voice.name}</ItemTitle>
                          <ItemDescription dir="auto" className="line-clamp-1">
                            {voice.vibe}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          {/* Reserves the corner for the play button overlaid
                              below — a button can't nest inside a button. */}
                          <span aria-hidden className="size-7" />
                        </ItemActions>
                      </button>
                    </Item>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="absolute inset-e-3 top-1/2 -translate-y-1/2"
                      aria-label={
                        playing
                          ? `Stop ${voice.name} sample`
                          : `Play ${voice.name} sample`
                      }
                      onClick={() => setPlayingId(playing ? null : voice.id)}
                    >
                      {playing ? <StopPreviewIcon /> : <PlayPreviewIcon />}
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        {hasMore ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-background to-transparent"
          />
        ) : null}
      </div>
    </div>
  )
}
