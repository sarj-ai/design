"use client"

import * as React from "react"

import { toast } from "sonner"

import { FieldHint } from "@/components/design-system/field-hint"
import { CloseIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

/**
 * The drawer, configuring one thing.
 *
 * Deliberately not the multi-step shell. A drawer is the surface for "you
 * still need the page behind it" — you are adjusting something in a list you
 * are still reading — and that is the opposite of a creation flow, which takes
 * the whole screen because the page behind it no longer matters. So a drawer
 * never carries steps: it configures one setting or shows one thing, and if it
 * needs a second screen it was a pop-up all along.
 *
 * A title and Close, and no icon tile — the platform does not put one there,
 * and a glyph beside a title the title already names is decoration.
 * `ItemMedia variant="icon"` earns one on a settings row, because there it
 * tells one row from the next; a drawer has no list to be told apart within.
 *
 * No description either. AGENTS.md fixes the header as title + description +
 * Close, and this drawer is the exception that shows why the description has
 * to earn its place: you reach it from a button reading "Configure
 * availability", so a line saying what "Check availability" is repeats the
 * click you just made. Keep the slot where the title is a bare object name and
 * the reader arrives cold — drop it where the route already said it.
 *
 * Explanations are the (i), not a line under every label. Six inline
 * descriptions at 384px is six two-line paragraphs, and the panel stopped
 * being a list of settings you can scan and became prose with controls in it.
 * A settings drawer is read many times and answered once — the opposite of a
 * form, where the reader is meeting each field for the first time.
 *
 * So the channel follows the surface: a form explains inline, a drawer and a
 * dialog step explain on hover, and either way one screen speaks one language
 * throughout. The Forms topic states it as a rule.
 */

const CALENDARS = ["Google Calendar", "Outlook", "Cal.com"]
const SLOTS = ["15 minutes", "30 minutes", "60 minutes"]
const TIMEOUTS = ["5 seconds", "10 seconds", "30 seconds", "60 seconds"]
const FALLBACKS = [
  "Offer a callback",
  "Transfer to a human",
  "Say it cannot check",
]

export function DrawerPreview() {
  const [calendar, setCalendar] = React.useState(CALENDARS[0])
  const [ahead, setAhead] = React.useState("14")
  const [slot, setSlot] = React.useState(SLOTS[1])
  const [timeout, setTimeoutValue] = React.useState(TIMEOUTS[1])
  const [retries, setRetries] = React.useState("2")
  const [fallback, setFallback] = React.useState(FALLBACKS[0])

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        {/* Named for the tool it opens, not "Configure tool": the surface
            table above has a drawer sample of its own and two buttons reading
            the same on one tab is a coin toss. */}
        <Button className="self-start" variant="outline">
          Configure availability
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <DrawerTitle>Check availability</DrawerTitle>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-col gap-6 overflow-y-auto p-4">
          {/* Legends now, where two fields did not earn them. The rule has
              not changed — six settings across two concerns is a group, two
              fields under a separator was not.

              A rung of its own, set here because the primitive does not offer
              one: its default legend is text-base font-medium, which is the
              drawer title exactly, and its `variant="label"` is text-sm
              font-medium, which is the field labels exactly. A heading that
              matches the thing above it or the things below it is not a
              heading. text-sm font-semibold is neither.

              The size is the primitive's own: `data-[variant=legend]:text-base`,
              left alone. Held at text-sm the legend was 14px beside a 14px
              field label and the only difference between a heading and the
              things under it was 100 of font weight, which is not a difference
              a reader sees. 16 over 14 is.

              mb-4 because FieldSet's own gap-4 never reaches the legend — a
              `<legend>` is pulled out of its fieldset's flex flow, so the only
              thing under it was the primitive's mb-1.5, and six pixels does
              not separate a heading from what it heads.

              16 and not 24: once the legend is 16px against a 14px label, size
              carries the hierarchy and the gap does not have to. A heading
              belongs nearer the thing it heads than that thing is to its
              neighbour — 16 below against 20 between fields binds it downward,
              where 24 had it floating between the two groups.

              Both legends are phrases rather than nouns, because a legend
              reading "Calendar" over a field reading "Calendar" is a repeated
              label whatever size it is set in. */}
          <FieldSet>
            <FieldLegend className="mb-4 font-semibold">
              Where it looks
            </FieldLegend>

            <FieldGroup>
              <Field>
                <FieldHint
                  hint="The account the agent reads free and busy from."
                  htmlFor="drawer-calendar"
                >
                  Calendar
                </FieldHint>
                <NativeSelect
                  className="w-full"
                  id="drawer-calendar"
                  onChange={(event) => setCalendar(event.target.value)}
                  value={calendar}
                >
                  {CALENDARS.map((one) => (
                    <NativeSelectOption key={one}>{one}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              <Field>
                <FieldHint
                  hint="How many days out it will offer. Up to 90."
                  htmlFor="drawer-ahead"
                >
                  Look-ahead
                </FieldHint>
                <Input
                  id="drawer-ahead"
                  inputMode="numeric"
                  onChange={(event) => setAhead(event.target.value)}
                  value={ahead}
                />
              </Field>

              <Field>
                <FieldHint
                  hint="The size of the openings it offers the caller."
                  htmlFor="drawer-slot"
                >
                  Slot length
                </FieldHint>
                <NativeSelect
                  className="w-full"
                  id="drawer-slot"
                  onChange={(event) => setSlot(event.target.value)}
                  value={slot}
                >
                  {SLOTS.map((one) => (
                    <NativeSelectOption key={one}>{one}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend className="mb-4 font-semibold">
              When it cannot check
            </FieldLegend>

            <FieldGroup>
              <Field>
                <FieldHint
                  hint="How long the agent waits before it stops holding the call."
                  htmlFor="drawer-timeout"
                >
                  Timeout
                </FieldHint>
                <NativeSelect
                  className="w-full"
                  id="drawer-timeout"
                  onChange={(event) => setTimeoutValue(event.target.value)}
                  value={timeout}
                >
                  {TIMEOUTS.map((one) => (
                    <NativeSelectOption key={one}>{one}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              <Field>
                <FieldHint
                  hint="Attempts before the agent tells the caller it cannot check."
                  htmlFor="drawer-retries"
                >
                  Retries
                </FieldHint>
                <Input
                  id="drawer-retries"
                  inputMode="numeric"
                  onChange={(event) => setRetries(event.target.value)}
                  value={retries}
                />
              </Field>

              <Field>
                <FieldHint
                  hint="What it does once the retries run out."
                  htmlFor="drawer-fallback"
                >
                  Fallback
                </FieldHint>
                <NativeSelect
                  className="w-full"
                  id="drawer-fallback"
                  onChange={(event) => setFallback(event.target.value)}
                  value={fallback}
                >
                  {FALLBACKS.map((one) => (
                    <NativeSelectOption key={one}>{one}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </FieldGroup>
          </FieldSet>
        </div>

        {/* The same bar the pop-up has: CardFooter is `border-t bg-muted/50`,
            and DrawerFooter ships with neither, so the actions floated on the
            same white as the fields. rounded-bl-xl because a right drawer is
            rounded-l-xl and nothing clips the corner — a squared fill would
            show past it. */}
        <DrawerFooter className="flex-row justify-end rounded-bl-xl border-t bg-muted/50">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button onClick={() => toast.success("Check availability updated")}>
              Save
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
