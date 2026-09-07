"use client"

import { FieldHint } from "@/components/design-system/field-hint"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

/**
 * One form carrying every decision at once, so the rules beside it can be
 * checked rather than taken on trust.
 *
 * Static on purpose: the error and the read-only row are states a live form
 * would only reach by being driven into them, and the point here is that all
 * of the decisions are visible in a single glance.
 */
export function FormDemo() {
  return (
    <form className="flex max-w-xl flex-col gap-6">
      <FieldSet>
        <FieldLegend className="mb-4 font-semibold data-[variant=legend]:text-sm">Voice</FieldLegend>

        <FieldGroup>
          {/* Most of this form is required, so the few that are not are what
              gets marked. Asterisks on five of six fields are not information,
              they are a texture. */}
          <Field>
            <FieldLabel htmlFor="form-demo-name">Display name</FieldLabel>
            <Input defaultValue="Layla" id="form-demo-name" />
          </Field>

          {/* Help text the reader needs in order to answer: it says what the
              choice does elsewhere, which is not guessable from "Language". */}
          <Field>
            <FieldLabel htmlFor="form-demo-language">Language</FieldLabel>
            <FieldDescription>
              Every scenario this voice is assigned to answers in it.
            </FieldDescription>
            <NativeSelect
              className="w-full"
              defaultValue="ar"
              id="form-demo-language"
            >
              <NativeSelectOption value="ar">Arabic</NativeSelectOption>
              <NativeSelectOption value="en">English</NativeSelectOption>
              <NativeSelectOption value="ur">Urdu</NativeSelectOption>
            </NativeSelect>
          </Field>

          {/* The control is as wide as the value it takes. Three characters
              in a 576px box asks for a sentence and then rejects one.

              max-w rather than w: the vertical Field sets `*:w-full` on every
              direct child, and a child selector outranks the control's own
              class. A cap wins over a width without fighting it. */}
          <Field>
            <FieldLabel htmlFor="form-demo-rate">Speaking rate</FieldLabel>
            <FieldDescription>
              Between 0.5 and 2.0. Most voices sit at 1.0.
            </FieldDescription>
            <Input
              className="max-w-24"
              defaultValue="1.0"
              id="form-demo-rate"
              inputMode="decimal"
            />
          </Field>

          {/* Everything a field says, it says above its control: label, then
              help, then the error, then the box. The control is the last thing
              in every field, so a column of them keeps one rhythm instead of
              growing a line under whichever box happens to be in trouble.

              The label stays the colour it always is — the border and this
              line carry the state. The placeholder is an example of the shape,
              and it is gone by the second keystroke, so nothing needed while
              typing is in it. */}
          <Field>
            <FieldLabel htmlFor="form-demo-sample">Sample script</FieldLabel>
            <FieldError>Add a line for the voice to read.</FieldError>
            <Textarea
              aria-invalid
              id="form-demo-sample"
              placeholder="Good morning, this is Layla from Rawabi Holding."
              rows={2}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="form-demo-notes">
              Notes{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input id="form-demo-notes" />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend className="mb-4 font-semibold data-[variant=legend]:text-sm">Availability</FieldLegend>

        <FieldGroup>
          {/* The one horizontal case: a switch, label start, control end. */}
          <Field orientation="horizontal">
            <FieldLabel htmlFor="form-demo-active">Active</FieldLabel>
            <Switch defaultChecked id="form-demo-active" />
          </Field>

          {/* Background rather than instruction: knowing what barge-in means
              does not change how you answer, it changes whether you know what
              you are answering. That is the (i)'s whole remit. */}
          <Field orientation="horizontal">
            <FieldHint
              className="flex-auto"
              hint="Lets the caller interrupt the agent mid-sentence instead of waiting for it to finish."
              htmlFor="form-demo-barge"
            >
              Barge-in
            </FieldHint>
            <Switch id="form-demo-barge" />
          </Field>

          {/* Read-only stays on screen, disabled, with the reason above it.
              The reason is help text like any other, so it sits where all help
              text sits — under the label. Below the control it reads as
              something that happened because of the value, which is what an
              error is, and it is the only thing that goes there. */}
          <Field>
            <FieldLabel htmlFor="form-demo-provider">Provider</FieldLabel>
            <FieldDescription>
              Set by the workspace and the same for every voice in it.
            </FieldDescription>
            <Input
              defaultValue="Hamsa"
              disabled
              id="form-demo-provider"
              readOnly
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* Cancel first as outline, then the one primary. */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="button">Save voice</Button>
      </div>
    </form>
  )
}
