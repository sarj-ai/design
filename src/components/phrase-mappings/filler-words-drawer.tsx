"use client"

import * as React from "react"

import { Accordion } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MAX_MAPPINGS,
  findConflicts,
  newMapping,
  problems,
  type FillerConfig,
  type Mapping,
  type PreviewVoice,
} from "@/lib/phrase-mappings-data"
import { MappingRow } from "@/components/phrase-mappings/mapping-row"
import { GenericFillerField } from "@/components/phrase-mappings/generic-filler-field"
import {
  AddMappingIcon,
  CloseIcon,
  ConflictIcon,
  FillerWordsIcon,
  OverrideIcon,
} from "@/components/phrase-mappings/icons"

/**
 * The acknowledgments drawer: the generic filler words that ship today, and
 * phrase-response mappings beside them.
 *
 * **The panel is no longer called "filler words".** It held a section called
 * Generic filler words, so the panel and its own first section were reading as
 * the same thing. Acknowledgments is what both halves produce — one at random,
 * one exactly — and it is the word the mappings section already used.
 *
 * **Each half switches on its own.** Review, Fatma, Aug 2026: one switch over
 * both of them made "I want exact answers to five greetings and no random
 * filler" impossible to express. They fire at the same moment in a call but
 * they are not one behaviour, so they are not one control.
 *
 * **A persona still inheriting sees one read-only language, not three.** Every
 * control stays on screen and every one of them is disabled — the switches and
 * Done included, so the reader can see which halves the global set has on. No
 * banner explaining it: the Override switch is right there at the top, off,
 * and a panel of dead controls under it needs no caption.
 */
export function FillerWordsDrawer({
  config,
  inherited,
  onChange,
  onCreateOverride,
  onOpenChange,
  onRemoveOverride,
  open,
  persona,
  voice,
}: {
  config: FillerConfig
  /** Persona scope only: the persona has no override yet. */
  inherited: boolean
  onChange: (config: FillerConfig) => void
  onCreateOverride: () => void
  onOpenChange: (open: boolean) => void
  onRemoveOverride: () => void
  open: boolean
  /** Name of the persona being edited, or undefined in global settings. */
  persona?: string
  /** The voice this scope's mapped responses are heard in. */
  voice: PreviewVoice
}) {
  const fieldId = React.useId()
  /* Which mapping is expanded. Adding one opens it, because a new mapping is
     empty and the reader's next act is always to fill it in. */
  const [openMapping, setOpenMapping] = React.useState<string>("")

  const conflicts = findConflicts(config.mappings)
  const blocking = problems(config)
  const full = config.mappings.length >= MAX_MAPPINGS

  const set = (patch: Partial<FillerConfig>) =>
    onChange({ ...config, ...patch })

  const setMapping = (next: Mapping) =>
    set({
      mappings: config.mappings.map((mapping) =>
        mapping.id === next.id ? next : mapping,
      ),
    })

  const addMapping = () => {
    const mapping = newMapping()
    set({ mappings: [...config.mappings, mapping] })
    setOpenMapping(mapping.id)
  }

  /**
   * Which mappings clash, by position in the list rather than by response.
   *
   * The response would name them more precisely, but it can run to 80
   * characters of Arabic, and dropping two of those into an English sentence
   * makes a line nobody can read in either direction.
   */
  const positionsOf = (ids: string[]) => {
    const positions = ids
      .map((id) => config.mappings.findIndex((entry) => entry.id === id) + 1)
      .sort((a, b) => a - b)

    if (positions.length < 3) return positions.join(" and ")
    return `${positions.slice(0, -1).join(", ")} and ${positions.at(-1)}`
  }

  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
      {/* Wider than the primitive's own sm:max-w-sm: a mapping's editor is two
          columns of fields under a chip list. */}
      <DrawerContent className="sm:max-w-2xl!">
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="flex flex-col gap-0.5">
            <DrawerTitle>Acknowledgments</DrawerTitle>
            {/* Carries the one fact a reader cannot get from the controls: an
                acknowledgment is played on top of the answer, never instead
                of it. */}
            <DrawerDescription>
              Played once the caller finishes. The agent&rsquo;s own answer
              still follows.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* A right-side drawer reads any horizontal drag as drag-to-close, so
            the frequency slider dismissed the whole panel. This opts the body
            out; the header still drags, and Escape, the overlay, Close and
            Cancel all still shut it. */}
        <div
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4"
          data-vaul-no-drag
        >
          {persona ? (
            <Item variant="muted">
              <ItemMedia variant="icon">
                <OverrideIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Override for {persona}</ItemTitle>
                {/* One line, the same in both states. It says what the switch
                    does, not which way it is set — the switch says that, and
                    the dead controls below say what it means. */}
                <ItemDescription>
                  Replaces the global set — later global edits do not reach{" "}
                  {persona}.
                </ItemDescription>
              </ItemContent>
              <ItemActions className="self-start">
                <Switch
                  aria-label={`Override acknowledgments for ${persona}`}
                  checked={!inherited}
                  onCheckedChange={(on) =>
                    on ? onCreateOverride() : onRemoveOverride()
                  }
                />
              </ItemActions>
            </Item>
          ) : null}

          <section className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                {/* No "Existing" chip. Which half of this panel the ticket
                    changes is a note for a reviewer, not a fact about the
                    product — a client opening this drawer has no use for it,
                    and a pill that says nothing about state is the wrong thing
                    to spend a pill on. */}
                <h3 className="text-base font-medium">Generic filler words</h3>
                <p className="text-sm text-muted-foreground">
                  Played at random after a turn when no mapping matches.
                </p>
              </div>
              <Switch
                aria-label="Generic filler words"
                checked={config.fillersEnabled}
                className="mt-1 shrink-0"
                disabled={inherited}
                onCheckedChange={(fillersEnabled) => set({ fillersEnabled })}
              />
            </div>

            {/* No "Words" label. The section is called Generic filler words
                and the only thing under it is the words — a heading and the
                thing under it saying the same word is one of them to delete.
                Frequency keeps its label because it names a second control. */}
            {config.fillersEnabled ? (
              <>
                <Field>
                  <GenericFillerField
                    disabled={inherited}
                    fillers={config.fillers}
                    onAdd={(filler) =>
                      set({ fillers: [...config.fillers, filler] })
                    }
                    onRemove={(filler) =>
                      set({
                        fillers: config.fillers.filter(
                          (value) => value !== filler,
                        ),
                      })
                    }
                  />
                </Field>

                {/* Frequency belongs to the words, so it goes when the last
                    one does: how often to play nothing is not a setting, and a
                    live slider over an empty list reads as a bug. It comes
                    back at its old value with the first word. */}
                {config.fillers.length ? (
                  <Field>
                    <div className="flex items-center justify-between gap-2">
                      <FieldTitle>Frequency</FieldTitle>
                      <span className="text-sm tabular-nums">
                        {config.frequency.toFixed(2)}
                      </span>
                    </div>
                    <FieldDescription>
                      Applies to the generic words only. A matched phrase always
                      plays.
                    </FieldDescription>
                    <Slider
                      aria-label="Generic filler frequency"
                      disabled={inherited}
                      max={1}
                      min={0}
                      onValueChange={([next]) => set({ frequency: next })}
                      step={0.05}
                      value={[config.frequency]}
                    />
                  </Field>
                ) : null}
              </>
            ) : null}
          </section>

          <FieldSeparator />

          <section className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium">
                    Phrase-response mappings
                  </h3>
                  <Badge className="tabular-nums" variant="secondary">
                    {config.mappings.length} of {MAX_MAPPINGS}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Several caller phrases can produce one exact acknowledgment.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* Disabled at the ceiling and while inheriting, and the
                    tooltip says which — a button that stops working without a
                    reason reads as broken. Still hidden when the whole half is
                    switched off, because then there is no list to add to. */}
                {config.mappingsEnabled ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="shrink-0">
                        <Button
                          disabled={inherited || full}
                          onClick={addMapping}
                          size="sm"
                          variant="outline"
                        >
                          <AddMappingIcon />
                          Add mapping
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {inherited ? (
                      <TooltipContent className="max-w-64">
                        {persona} is following the global set. Turn on Override
                        to add a mapping for {persona} alone.
                      </TooltipContent>
                    ) : full ? (
                      <TooltipContent className="max-w-64">
                        Maximum of {MAX_MAPPINGS} mappings. Delete one to add
                        another.
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                ) : null}
                <Switch
                  aria-label="Phrase-response mappings"
                  checked={config.mappingsEnabled}
                  disabled={inherited}
                  onCheckedChange={(mappingsEnabled) =>
                    set({ mappingsEnabled })
                  }
                />
              </div>
            </div>

            {!config.mappingsEnabled ? null : config.mappings.length ? (
              <Accordion
                className="gap-3"
                collapsible
                onValueChange={setOpenMapping}
                type="single"
                value={openMapping}
              >
                {config.mappings.map((mapping) => (
                  <MappingRow
                    conflicts={conflicts}
                    fieldId={`${fieldId}-${mapping.id}`}
                    key={mapping.id}
                    mapping={mapping}
                    disabled={inherited}
                    onChange={setMapping}
                    onRemove={() =>
                      set({
                        mappings: config.mappings.filter(
                          (entry) => entry.id !== mapping.id,
                        ),
                      })
                    }
                    voice={voice}
                  />
                ))}
              </Accordion>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FillerWordsIcon />
                  </EmptyMedia>
                  <EmptyTitle>No phrase mappings yet</EmptyTitle>
                  <EmptyDescription>
                    Every caller turn is answered by the generic filler words
                    above.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}

            {/* A clash is between two rules, so it is reported once under the
                list rather than twice inside the cards — the cards carry the
                ring and the tinted chip that point back here. */}
            {(config.mappingsEnabled ? conflicts : []).map((conflict) => (
              <Alert key={conflict.phrase} variant="destructive">
                <ConflictIcon />
                {/* The Arabic sits at the end of the sentence, not in the
                    middle: an RTL run between two English clauses reorders the
                    whole line and the reader loses which word is the problem. */}
                <AlertTitle>
                  Mappings {positionsOf(conflict.mappingIds)} both claim{" "}
                  <span dir="auto">&ldquo;{conflict.phrase}&rdquo;</span>
                </AlertTitle>
                <AlertDescription>Remove it from one of them.</AlertDescription>
              </Alert>
            ))}
          </section>
        </div>

        <DrawerFooter className="flex-row items-center justify-between gap-4 border-t bg-muted/50">
          <div className="flex min-w-0 flex-col gap-1">
            {blocking.length ? (
              <span className="text-xs text-destructive">
                {blocking.join(" · ")}
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <DrawerClose asChild>
              {/* Blocked, not hidden: the PRD keeps the input on screen so the
                  reader can fix it rather than retype it. Dead the same way
                  while inheriting, because there is nothing staged to keep. */}
              <Button disabled={inherited || blocking.length > 0}>Done</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
