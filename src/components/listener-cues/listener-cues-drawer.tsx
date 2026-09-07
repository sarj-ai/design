"use client"

import * as React from "react"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldLabel, FieldSeparator } from "@/components/ui/field"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  COOLDOWN_OPTIONS,
  FREQUENCY_MIN,
  FREQUENCY_STEP,
  MAX_PER_TURN_OPTIONS,
  RECOMMENDED,
  START_AFTER_OPTIONS,
  addCue,
  approvedClips,
  displayWeights,
  languageLabel,
  removeCue,
  setWeight,
  type CueConfig,
  type Language,
} from "@/lib/listener-cues-data"
import { CueRow } from "@/components/listener-cues/cue-row"
import {
  AddCueIcon,
  CloseIcon,
  InMixIcon,
  NoClipsIcon,
  OverrideIcon,
  PickerChevronIcon,
} from "@/components/listener-cues/icons"

/**
 * The listener-cue configuration, in one panel.
 *
 * Global defaults and a persona override are the same controls — the PRD asks
 * for both in the same settings pattern — so the scope only changes whose
 * values are on screen and whether they can be edited yet. An inherited persona
 * shows the globals read-only until an override is created, because a control
 * that silently edits nothing is worse than a disabled one.
 */
export function ListenerCuesDrawer({
  config,
  inherited,
  language,
  onChange,
  onCreateOverride,
  onOpenChange,
  onRemoveOverride,
  open,
  persona,
}: {
  config: CueConfig
  /** Persona scope only: the persona has no override yet. */
  inherited: boolean
  language: Language
  onChange: (config: CueConfig) => void
  onCreateOverride: () => void
  onOpenChange: (open: boolean) => void
  onRemoveOverride: () => void
  open: boolean
  /** Name of the persona being edited, or undefined in global settings. */
  persona?: string
}) {
  const fieldId = React.useId()
  const clips = approvedClips(language, config.cues)
  const inMixCount = clips.filter((entry) => entry.inMix).length
  const shown = displayWeights(config.cues)

  /**
   * Where a percentage sits along the slider, as CSS.
   *
   * The scale starts at the minimum, not at zero, and the thumb's own width
   * insets both ends of its travel — so a plain percentage of the row lands
   * beside the thumb rather than under it. Both are accounted for here, and
   * everything drawn under the track is positioned through it.
   */
  const span = 100 - FREQUENCY_MIN
  const THUMB_PX = 12
  const at = (value: number) =>
    `calc(${(value - FREQUENCY_MIN) / span} * (100% - ${THUMB_PX}px) + ${THUMB_PX / 2}px)`
  const bandWidth = `calc(${(RECOMMENDED.max - RECOMMENDED.min) / span} * (100% - ${THUMB_PX}px))`
  /** Half the value label's own width, so it can be kept on the track. */
  const VALUE_HALF_PX = 20

  const set = (patch: Partial<CueConfig>) => onChange({ ...config, ...patch })

  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
      {/* A side panel wider than the primitive's own sm:max-w-sm — the cue mix
          is a list of rows with a slider each. */}
      <DrawerContent className="sm:max-w-2xl!">
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="flex flex-col gap-0.5">
            <DrawerTitle>Configure listener cues</DrawerTitle>
            <DrawerDescription>
              Short acknowledgments during longer caller turns.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* A right-side drawer treats any horizontal drag as drag-to-close, so
            dragging a weight slider dismissed the whole panel. This opts the
            body out of the gesture; the header still drags, and Escape, the
            overlay, Close and Cancel all still shut it. */}
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
                {/* One line, the same in both states — it says what the
                    switch does, not which way it is set. The switch itself
                    says that, and the dead controls below say what it means.
                    Swapping the text made one flip change three things at
                    once: this line, a read-only paragraph that pushed the
                    whole panel down, and a dim over everything under it. */}
                <ItemTitle>Override for {persona}</ItemTitle>
                <ItemDescription>
                  Replaces the global defaults — later global edits do not reach{" "}
                  {persona}.
                </ItemDescription>
              </ItemContent>

              {/* Pinned to the title's line, where the icon column already
                  sits — centred on the block it read as adrift between the two
                  lines. */}
              <ItemActions className="self-start">
                <Switch
                  aria-label={`Override listener cues for ${persona}`}
                  checked={!inherited}
                  onCheckedChange={(on) =>
                    on ? onCreateOverride() : onRemoveOverride()
                  }
                />
              </ItemActions>
            </Item>
          ) : null}

          {/* The PRD asks for inherited controls to be disabled until an
              override exists, and every one of them is. Nothing else marks the
              state. A read-only paragraph and a dim over the whole block both
              repeated what the switch above already says, and the paragraph
              pushed every setting down the moment the switch moved — so the
              panel reflowed to tell you something it had told you twice.
              Flipping the switch now changes one thing: whether the controls
              take input. The sibling Filler words drawer settled on the same
              answer in review. */}
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  {/* The total sits with the heading, at the head of the column
                    of shares below it. Success-tinted because it is the one
                    thing on this section that says the mix is valid — it is a
                    state, not a label. */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium">Cue mix</h3>
                    {config.cues.length ? (
                      <Badge
                        variant="secondary"
                        className="bg-success-tint text-success-tint-foreground tabular-nums"
                      >
                        Total 100%
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Move one percentage and the remaining share rebalances
                    automatically.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      {/* "Add approved cue", not "Add cue". The button picks
                        from Sarj's existing clips; recording a new one is a
                        Potential Upgrade in the PRD and does not exist. Called
                        "Add cue" it read as "make one", which is what sent the
                        first reviewer looking for where cues are created.

                        Not disabled once every clip is in the mix. A dead
                        button is the one state that cannot explain itself, and
                        "there are four approved cues and you have all four" is
                        exactly what the reader is here to find out. */}
                      <Button disabled={inherited} size="sm" variant="outline">
                        <AddCueIcon />
                        Add approved cue
                        <PickerChevronIcon />
                      </Button>
                    </DropdownMenuTrigger>

                    {/* This menu is where "cues come from a fixed, approved set"
                      has to be legible, because it is the only moment the
                      reader asks. So it names the set, counts it, keeps the
                      clips already in the mix on the list as ticked rows, and
                      says the rule once underneath. Widened past the trigger:
                      the primitive matches the button's width, which left a
                      120px box holding a single word. */}
                    <DropdownMenuContent align="end" className="w-72">
                      <DropdownMenuLabel className="flex items-center justify-between gap-2">
                        <span>Approved {languageLabel(language)} cues</span>
                        <span className="tabular-nums">
                          {inMixCount} of {clips.length} in mix
                        </span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {clips.map(({ clip, inMix }) => (
                        <DropdownMenuItem
                          disabled={inMix}
                          key={clip.id}
                          onSelect={() =>
                            set({ cues: addCue(config.cues, clip) })
                          }
                        >
                          {/* The auto margin sits on the wrapper, not on the
                            dir="auto" span: a logical margin resolves against
                            its own element's direction, so on an Arabic clip
                            me-auto became a left margin and shunted the word
                            across the row into the "In mix" column. */}
                          <div className="me-auto min-w-0">
                            <span className="block truncate" dir="auto">
                              {clip.label}
                            </span>
                          </div>
                          {inMix ? (
                            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                              <InMixIcon className="size-3.5" />
                              In mix
                            </span>
                          ) : null}
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator />
                      {/* The menu lists what exists; this says why there is
                        nothing to add. Recording a cue in the editor is a
                        Potential Upgrade in the PRD, not V1 — without saying
                        so, the absence of an Add button reads as an oversight
                        and the first question every reviewer asks is where
                        the cues came from. */}
                      <p className="px-1.5 py-1 text-xs text-muted-foreground">
                        Sarj approves cue clips per language, and this is the
                        whole approved set. Nothing is generated on the call,
                        and new clips are not recorded here.
                      </p>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {config.cues.length ? (
                config.cues.map((cue, index) => (
                  <CueRow
                    canRemove={config.cues.length > 1}
                    cue={cue}
                    disabled={inherited}
                    key={cue.id}
                    onRemove={() =>
                      set({ cues: removeCue(config.cues, cue.id) })
                    }
                    onWeightChange={(weight) =>
                      set({ cues: setWeight(config.cues, cue.id, weight) })
                    }
                    weight={shown[index]}
                  />
                ))
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <NoClipsIcon />
                    </EmptyMedia>
                    <EmptyTitle>No approved cues for this language</EmptyTitle>
                    <EmptyDescription>
                      Cues are approved per language before they can be mixed.
                      Until a clip is approved, listener cues stay off for calls
                      in this language even when the setting is on.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </section>

            <FieldSeparator />

            {/* Deliberately not a bg-muted inset: Slider's own track is bg-muted,
              so on a muted panel the unfilled half of the track vanishes and
              the control reads as a stray line. Plain, like every other
              section here. */}
            <section className="flex flex-col gap-3">
              {/* No (i) beside the title. The PRD asks to "mark the recommended
                  range", and the bracket under the track does that — a tooltip
                  repeating it in words is a second explanation language on a
                  screen that already describes every setting inline. */}
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-medium">Response frequency</h3>
                <p className="text-sm text-muted-foreground">
                  Chance of playing a cue at each eligible moment.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                {/* The value rides above the thumb rather than sitting in the
                  section header: the number and the thumb's position are the
                  same fact, and apart the reader converts one into the other.
                  Clamped to half its own width so it stays on the track at
                  either end. */}
                <div className="relative h-5">
                  <span
                    className="absolute w-10 -translate-x-1/2 text-center text-sm font-medium tabular-nums"
                    style={{
                      insetInlineStart: `clamp(${VALUE_HALF_PX}px, ${at(config.frequency)}, 100% - ${VALUE_HALF_PX}px)`,
                    }}
                  >
                    {config.frequency}%
                  </span>
                </div>

                <Slider
                  aria-label="Response frequency, percent"
                  disabled={inherited}
                  max={100}
                  min={FREQUENCY_MIN}
                  onValueChange={([next]) => set({ frequency: next })}
                  step={FREQUENCY_STEP}
                  value={[config.frequency]}
                />

                {/* The recommended stretch, bracketed under the track. Drawn as a
                  rule with end ticks, not as a filled bar — a bar of the same
                  weight directly under the track reads as a second slider and
                  the real one stops being findable. */}
                <div aria-hidden className="relative h-2">
                  <div
                    className="absolute inset-y-0 border-x-2 border-border"
                    style={{
                      insetInlineStart: at(RECOMMENDED.min),
                      width: bandWidth,
                    }}
                  >
                    <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                  </div>
                </div>

                {/* The range's name sits over the range, not over the middle of
                  the row — a label centred on the whole slider points at
                  whatever happens to be under the centre. */}
                <div className="relative h-4 text-xs">
                  <span className="absolute inset-s-0 text-muted-foreground tabular-nums">
                    {FREQUENCY_MIN}%
                  </span>
                  <span
                    className="absolute -translate-x-1/2 whitespace-nowrap text-muted-foreground"
                    style={{
                      insetInlineStart: at(
                        (RECOMMENDED.min + RECOMMENDED.max) / 2,
                      ),
                    }}
                  >
                    Recommended {RECOMMENDED.min}–{RECOMMENDED.max}%
                  </span>
                  <span className="absolute inset-e-0 text-muted-foreground tabular-nums">
                    100%
                  </span>
                </div>
              </div>
            </section>

            <FieldSeparator />

            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-medium">Timing limits</h3>
                <p className="text-sm text-muted-foreground">
                  Keep cues occasional during long explanations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-start`}>
                    Start after
                  </FieldLabel>
                  <Select
                    disabled={inherited}
                    onValueChange={(next) =>
                      set({ startAfterSec: Number(next) })
                    }
                    value={String(config.startAfterSec)}
                  >
                    <SelectTrigger id={`${fieldId}-start`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {START_AFTER_OPTIONS.map((seconds) => (
                        <SelectItem key={seconds} value={String(seconds)}>
                          {seconds} seconds
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${fieldId}-wait`}>
                    Wait between cues
                  </FieldLabel>
                  <Select
                    disabled={inherited}
                    onValueChange={(next) => set({ cooldownSec: Number(next) })}
                    value={String(config.cooldownSec)}
                  >
                    <SelectTrigger id={`${fieldId}-wait`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COOLDOWN_OPTIONS.map((seconds) => (
                        <SelectItem key={seconds} value={String(seconds)}>
                          {seconds} seconds
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${fieldId}-max`}>
                    Maximum per turn
                  </FieldLabel>
                  <Select
                    disabled={inherited}
                    onValueChange={(next) => set({ maxPerTurn: Number(next) })}
                    value={String(config.maxPerTurn)}
                  >
                    <SelectTrigger id={`${fieldId}-max`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAX_PER_TURN_OPTIONS.map((count) => (
                        <SelectItem key={count} value={String(count)}>
                          {count === 1 ? "1 cue" : `${count} cues`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>
          </div>
        </div>

        {/* Tinted, because the body scrolls underneath it. On the same surface
            as the content, a 1px rule was the only thing saying "this bar
            stays put" — and settings slid up to it and vanished mid-letter. */}
        {/* No staging note and no summary pills. The PRD's save contract is
            about behaviour — nothing here reaches a call until Save for All or
            Update Profile — and the page's own save button is what carries it;
            a caption restating it in the drawer is not a control. */}
        <DrawerFooter className="flex-row items-center justify-end gap-4 border-t bg-muted">
          <div className="flex shrink-0 items-center gap-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button>Done</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
