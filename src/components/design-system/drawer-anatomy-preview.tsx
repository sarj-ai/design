"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FieldHint } from "@/components/design-system/field-hint"
import { CloseIcon } from "@/components/design-system/icons"

/**
 * What a drawer is, built once: header, body, footer, and the guard on the
 * way out. The drawer here is a placeholder — voicemail detection on a
 * scenario — chosen because it is the common case: a handful of settings on
 * one thing, reached from a page the reader is still using.
 */

type Settings = {
  enabled: boolean
  window: string
  instructions: string
  action: string
  message: string
  language: string
  retry: boolean
  attempts: string
  gap: string
  giveUp: string
}

const INITIAL: Settings = {
  enabled: true,
  window: "10",
  instructions:
    "A recorded greeting, a beep, or a long pause after you speak means voicemail. A person saying hello back does not.",
  action: "leave",
  message:
    "Hi, this is Sarj calling about your appointment. We'll try you again later today.",
  language: "ar",
  retry: true,
  attempts: "3",
  gap: "30",
  giveUp: "24",
}

const WINDOWS = [
  { value: "5", label: "First 5 seconds" },
  { value: "10", label: "First 10 seconds" },
  { value: "15", label: "First 15 seconds" },
]

const LANGUAGES = [
  { value: "ar", label: "Arabic" },
  { value: "en", label: "English" },
]

/** Seconds it takes to say, at about 2.5 words a second. */
function spoken(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.ceil(words / 2.5)
}

const ACTIONS = [
  { value: "leave", label: "Leave a message, then hang up" },
  { value: "hangup", label: "Hang up straight away" },
  { value: "retry", label: "Hang up and retry later" },
]

export function DrawerAnatomyPreview() {
  const [open, setOpen] = React.useState(false)
  const [saved, setSaved] = React.useState(INITIAL)
  const [draft, setDraft] = React.useState(INITIAL)
  const [confirming, setConfirming] = React.useState(false)

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  function set(patch: Partial<Settings>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  /* Every way out — Close, Cancel, Esc, the overlay — comes through here, so
     unsaved edits are guarded once rather than per button. */
  function requestClose(next: boolean) {
    if (next) {
      setDraft(saved)
      setOpen(true)
      return
    }
    if (dirty) {
      setConfirming(true)
      return
    }
    setOpen(false)
  }

  function save() {
    setSaved(draft)
    setOpen(false)
    toast.success("Voicemail detection saved")
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Button onClick={() => requestClose(true)}>Open drawer</Button>
        <span className="text-sm text-muted-foreground">
          Voicemail detection, on a scenario
        </span>
      </div>

      <Drawer direction="right" open={open} onOpenChange={requestClose}>
        {/* 448, the one drawer width. 384 wrapped the three retry fields;
            every reference measured sits at 460–620. The `!` is needed: the
            primitive pins its width on a data-attribute variant, which a
            plain `sm:max-w-md` loses to. */}
        <DrawerContent className="sm:max-w-md!">
          {/* Title and Close. The button that opened this already named
              it, so a description would say it twice. */}
          <DrawerHeader className="flex flex-row items-center justify-between gap-4 border-b">
            <DrawerTitle>Voicemail detection</DrawerTitle>
            <DrawerClose asChild>
              <Button aria-label="Close" size="icon-sm" variant="ghost">
                <CloseIcon />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          {/* The only part that scrolls. Three sections, each with a
              legend and a rule above it; the header and footer stay put. */}
          <div className="flex-1 overflow-y-auto">
            <Section legend="Detection">
              <Field
                orientation="horizontal"
                className="items-center justify-between"
              >
                <FieldLabel className="flex-1" htmlFor="vm-enabled">
                  Detect voicemail
                </FieldLabel>
                <Switch
                  id="vm-enabled"
                  checked={draft.enabled}
                  onCheckedChange={(enabled) => set({ enabled })}
                />
              </Field>
              {draft.enabled ? (
                <>
                  <Field>
                    <FieldLabel htmlFor="vm-window">Listen during</FieldLabel>
                    <Select
                      value={draft.window}
                      onValueChange={(window) => set({ window })}
                    >
                      <SelectTrigger id="vm-window" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {WINDOWS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldHint
                      hint="What counts as voicemail. Written for the agent — the caller never hears it."
                      htmlFor="vm-instructions"
                    >
                      Agent instructions
                    </FieldHint>
                    <Textarea
                      id="vm-instructions"
                      rows={3}
                      value={draft.instructions}
                      onChange={(event) =>
                        set({ instructions: event.target.value })
                      }
                    />
                  </Field>
                </>
              ) : null}
            </Section>

            {draft.enabled ? (
              <Section legend="Message">
                <Field>
                  <FieldLabel htmlFor="vm-action">When detected</FieldLabel>
                  <Select
                    value={draft.action}
                    onValueChange={(action) => set({ action })}
                  >
                    <SelectTrigger id="vm-action" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {ACTIONS.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {draft.action === "leave" ? (
                  <>
                    <Field>
                      <div className="flex items-baseline justify-between gap-2">
                        <FieldHint
                          hint="Spoken after the beep, in the persona's voice. Most voicemail boxes cut off at 20 seconds."
                          htmlFor="vm-message"
                        >
                          Message
                        </FieldHint>
                        <span
                          className={cn(
                            "text-xs tabular-nums",
                            spoken(draft.message) > 20
                              ? "text-destructive"
                              : "text-muted-foreground",
                          )}
                        >
                          ~{spoken(draft.message)}s of 20s
                        </span>
                      </div>
                      <Textarea
                        id="vm-message"
                        rows={4}
                        value={draft.message}
                        onChange={(event) =>
                          set({ message: event.target.value })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="vm-language">Spoken in</FieldLabel>
                      <Select
                        value={draft.language}
                        onValueChange={(language) => set({ language })}
                      >
                        <SelectTrigger id="vm-language" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {LANGUAGES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </>
                ) : null}
              </Section>
            ) : null}

            {draft.enabled ? (
              <Section legend="Retry">
                <Field
                  orientation="horizontal"
                  className="items-center justify-between"
                >
                  <FieldLabel className="flex-1" htmlFor="vm-retry">
                    Call back after voicemail
                  </FieldLabel>
                  <Switch
                    id="vm-retry"
                    checked={draft.retry}
                    onCheckedChange={(retry) => set({ retry })}
                  />
                </Field>
                {draft.retry ? (
                  <div className="grid grid-cols-3 gap-3">
                    <NumberField
                      id="vm-attempts"
                      label="Attempts"
                      value={draft.attempts}
                      onChange={(attempts) => set({ attempts })}
                    />
                    <NumberField
                      id="vm-gap"
                      label="Minutes apart"
                      value={draft.gap}
                      onChange={(gap) => set({ gap })}
                    />
                    <NumberField
                      id="vm-give-up"
                      label="Stop after (h)"
                      value={draft.giveUp}
                      onChange={(giveUp) => set({ giveUp })}
                    />
                  </div>
                ) : null}
              </Section>
            ) : null}
          </div>

          <DrawerFooter className="flex-row justify-end border-t">
            <Button variant="outline" onClick={() => requestClose(false)}>
              Cancel
            </Button>
            <Button disabled={!dirty} onClick={save}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Voicemail detection goes back to how it was saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDraft(saved)
                setConfirming(false)
                setOpen(false)
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/**
 * One group in the body. Its name sits on a shaded band across the drawer,
 * the way a table's header row sits over its rows, so the sections read as
 * blocks without a hairline and a grey label doing the same job worse.
 */
function Section({
  legend,
  children,
}: {
  legend: string
  children: React.ReactNode
}) {
  const id = React.useId()

  return (
    <section aria-labelledby={id}>
      <h3
        id={id}
        className="bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground"
      >
        {legend}
      </h3>
      <FieldGroup className="gap-4 p-4">{children}</FieldGroup>
    </section>
  )
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        inputMode="numeric"
        type="number"
        min={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}
