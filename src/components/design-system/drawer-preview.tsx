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
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"

/**
 * The drawer, configuring one thing.
 *
 * Deliberately not the multi-step shell. A drawer is the surface for "you
 * still need the page behind it" — you are adjusting something in a list you
 * are still reading — and that is the opposite of a creation flow, which takes
 * the whole screen because the page behind it no longer matters. So a drawer
 * never carries steps: it configures one setting or shows one thing, and if it
 * needs a second screen it was a modal all along.
 *
 * The header is the shape AGENTS.md fixes: a title, a description and Close.
 * No icon tile — the platform does not put one there, and a glyph beside a
 * title the title already names is decoration. `ItemMedia variant="icon"`
 * earns one on a settings row, because there it tells one row from the next; a
 * drawer has no list to be told apart within.
 *
 * Explanations are the (i), not an inline description. The repo default is
 * inline and is right on a full-width form, but this panel is about 384px:
 * every description wrapped to two lines and pushed the controls under a wall
 * of prose. The multi-step form uses the same hint, so the whole page speaks
 * one language.
 */

const TIMEOUTS = ["5 seconds", "10 seconds", "30 seconds", "60 seconds"]

export function DrawerPreview() {
  const [enabled, setEnabled] = React.useState(true)
  const [timeout, setTimeoutValue] = React.useState(TIMEOUTS[1])
  const [retries, setRetries] = React.useState("2")

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
          <div className="flex flex-col gap-0.5">
            <DrawerTitle>Check availability</DrawerTitle>
            <DrawerDescription>
              The tool this agent calls to read the booking calendar.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-col gap-6 overflow-y-auto p-4">
          {/* The switch that turns the rest on sits above the rest, so the
              reader meets the condition before the things it governs. */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="drawer-enabled">Available to this agent</Label>
            <Switch
              checked={enabled}
              id="drawer-enabled"
              onCheckedChange={setEnabled}
            />
          </div>

          <FieldSeparator />

          {/* Greyed rather than removed while it is off: every control stays on
              screen so the reader can still see what is set, and the switch
              that turns editing back on is right above them. */}
          <Field>
            <FieldHint
              hint="How long the agent waits before it stops holding the call."
              htmlFor="drawer-timeout"
            >
              Timeout
            </FieldHint>
            <NativeSelect
              className="w-full"
              disabled={!enabled}
              id="drawer-timeout"
              onChange={(event) => setTimeoutValue(event.target.value)}
              value={timeout}
            >
              {TIMEOUTS.map((one) => (
                <option key={one}>{one}</option>
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
              disabled={!enabled}
              id="drawer-retries"
              inputMode="numeric"
              onChange={(event) => setRetries(event.target.value)}
              value={retries}
            />
          </Field>
        </div>

        <DrawerFooter className="flex-row justify-end border-t">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button
              disabled={!enabled}
              onClick={() => toast.success("Check availability updated")}
            >
              Save
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
