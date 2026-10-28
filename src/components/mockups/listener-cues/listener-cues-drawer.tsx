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
} from "@/lib/mockups/listener-cues-data"
import { CueRow } from "@/components/mockups/listener-cues/cue-row"
import {
  AddCueIcon,
  CloseIcon,
  InMixIcon,
  NoClipsIcon,
  OverrideIcon,
  PickerChevronIcon,
} from "@/components/mockups/listener-cues/icons"

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
  /** Undefined in global settings. */
  persona?: string
}) {
  const fieldId = React.useId()
  const clips = approvedClips(language, config.cues)
  const inMixCount = clips.filter((entry) => entry.inMix).length
  const shown = displayWeights(config.cues)

  /** Offsets for the scale's minimum and the thumb's inset, so marks sit under the thumb. */
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

        {/* Opts the body out of drag-to-close, so dragging a slider does not dismiss the drawer. */}
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
                <ItemDescription>
                  Replaces the global defaults — later global edits do not reach{" "}
                  {persona}.
                </ItemDescription>
              </ItemContent>

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

          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
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
                      <Button disabled={inherited} size="sm" variant="outline">
                        <AddCueIcon />
                        Add approved cue
                        <PickerChevronIcon />
                      </Button>
                    </DropdownMenuTrigger>

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
                          {/* Margin on the wrapper, not the dir="auto" span: a logical margin flips with its element's direction. */}
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

            {/* Not bg-muted: Slider's track is bg-muted and would vanish on it. */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-medium">Response frequency</h3>
                <p className="text-sm text-muted-foreground">
                  Chance of playing a cue at each eligible moment.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
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
                    <SelectContent position="popper">
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
                    <SelectContent position="popper">
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
                    <SelectContent position="popper">
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
