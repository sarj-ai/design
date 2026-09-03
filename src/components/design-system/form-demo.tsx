"use client"

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
 * eight decisions are visible in a single glance.
 */
export function FormDemo() {
  return (
    <form className="flex max-w-xl flex-col gap-6">
      <FieldSet>
        <FieldLegend>Voice</FieldLegend>

        <FieldGroup>
          {/* Required: the asterisk, and no description — the label is enough. */}
          <Field>
            <FieldLabel htmlFor="form-demo-name">
              Display name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input defaultValue="Layla" id="form-demo-name" />
          </Field>

          {/* Help text under the label, above the control. */}
          <Field>
            <FieldLabel htmlFor="form-demo-language">
              Language <span className="text-destructive">*</span>
            </FieldLabel>
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

          {/* The error state: the whole field turns, label included. */}
          <Field data-invalid>
            <FieldLabel htmlFor="form-demo-sample">
              Sample script <span className="text-destructive">*</span>
            </FieldLabel>
            <Textarea aria-invalid id="form-demo-sample" rows={2} />
            <FieldError>Add a line for the voice to read.</FieldError>
          </Field>

          {/* Optional carries nothing at all. */}
          <Field>
            <FieldLabel htmlFor="form-demo-notes">Notes</FieldLabel>
            <Input id="form-demo-notes" />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Availability</FieldLegend>

        <FieldGroup>
          {/* The one horizontal case: a switch, label start, control end. */}
          <Field orientation="horizontal">
            <FieldLabel htmlFor="form-demo-active">Active</FieldLabel>
            <Switch defaultChecked id="form-demo-active" />
          </Field>

          {/* Read-only stays on screen, disabled, with the reason under it. */}
          <Field>
            <FieldLabel htmlFor="form-demo-provider">Provider</FieldLabel>
            <Input
              defaultValue="Hamsa"
              disabled
              id="form-demo-provider"
              readOnly
            />
            <FieldDescription>
              Set by the workspace and the same for every voice in it.
            </FieldDescription>
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
