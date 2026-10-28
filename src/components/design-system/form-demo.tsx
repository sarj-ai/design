"use client"

import { FieldHint } from "@/components/design-system/field-hint"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { errorId, FieldHeader } from "@/components/design-system/field-header"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export function FormDemo() {
  return (
    <form className="flex max-w-xl flex-col gap-6">
      <FieldSet>
        <FieldLegend className="mb-4 font-semibold data-[variant=legend]:text-sm">
          Voice
        </FieldLegend>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="form-demo-name">Display name</FieldLabel>
            <Input defaultValue="Layla" id="form-demo-name" />
          </Field>

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

          {/* max-w, not w: the vertical Field's `*:w-full` outranks the control's own width class. */}
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

          <Field>
            <FieldHeader
              error="Add a line for the voice to read."
              htmlFor="form-demo-sample"
            >
              Sample script
            </FieldHeader>
            <Textarea
              aria-describedby={errorId("form-demo-sample")}
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
        <FieldLegend className="mb-4 font-semibold data-[variant=legend]:text-sm">
          Availability
        </FieldLegend>

        <FieldGroup>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="form-demo-active">Active</FieldLabel>
            <Switch defaultChecked id="form-demo-active" />
          </Field>

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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="button">Save voice</Button>
      </div>
    </form>
  )
}
