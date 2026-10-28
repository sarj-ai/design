"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ALL_SCOPES,
  READ_ONLY_SCOPES,
  SCOPE_GROUPS,
  type Permission,
} from "@/lib/mockups/connected-apps-data"

type Preset = "read-only" | "full" | "custom"

const PRESETS: { id: Preset; label: string; help: string }[] = [
  {
    id: "read-only",
    label: "Read-only",
    help: `Every read permission — ${READ_ONLY_SCOPES.length} of ${ALL_SCOPES.length}. Can list and fetch, can change nothing.`,
  },
  {
    id: "full",
    label: "Full access",
    help: `All ${ALL_SCOPES.length} permissions. Everything this organization can do through the API.`,
  },
  {
    id: "custom",
    label: "Custom",
    help: "Pick permissions one by one.",
  },
]

export function ScopePicker({
  onChange,
  scopes,
}: {
  onChange: (scopes: Permission[]) => void
  scopes: Permission[]
}) {
  const [preset, setPreset] = React.useState<Preset>("read-only")

  function selectPreset(next: Preset) {
    setPreset(next)
    if (next === "read-only") onChange(READ_ONLY_SCOPES)
    if (next === "full") onChange(ALL_SCOPES)
  }

  function toggle(permission: Permission, granted: boolean) {
    onChange(
      granted
        ? [...scopes, permission]
        : scopes.filter((value) => value !== permission),
    )
  }

  return (
    <Field>
      {/* FieldTitle, not FieldLabel: a radio group and a checkbox grid have no single id. */}
      <FieldTitle>Scopes</FieldTitle>

      <RadioGroup
        className="gap-2"
        onValueChange={(value) => selectPreset(value as Preset)}
        value={preset}
      >
        {PRESETS.map((option) => (
          <FieldLabel htmlFor={`preset-${option.id}`} key={option.id}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{option.label}</FieldTitle>
                <FieldDescription>{option.help}</FieldDescription>
              </FieldContent>
              <RadioGroupItem id={`preset-${option.id}`} value={option.id} />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>

      {preset === "custom" ? (
        <div className="flex flex-col gap-3 rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium tabular-nums">
              {scopes.length} of {ALL_SCOPES.length} permissions
            </span>
            <Button
              className="ms-auto"
              onClick={() => onChange(READ_ONLY_SCOPES)}
              size="xs"
              variant="ghost"
            >
              All read
            </Button>
            <Button onClick={() => onChange([])} size="xs" variant="ghost">
              Clear
            </Button>
          </div>

          <ScrollArea className="h-56">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 gap-y-2 pe-3">
              <span />
              <span className="text-xs text-muted-foreground">Read</span>
              <span className="text-xs text-muted-foreground">Write</span>

              {SCOPE_GROUPS.map((group) => (
                <React.Fragment key={group.read}>
                  <span className="text-sm">{group.label}</span>

                  {/* The exact permission string is the accessible name. */}
                  <Checkbox
                    aria-label={group.read}
                    checked={scopes.includes(group.read)}
                    onCheckedChange={(checked) =>
                      toggle(group.read, checked === true)
                    }
                  />

                  {group.write ? (
                    <Checkbox
                      aria-label={group.write}
                      checked={scopes.includes(group.write)}
                      onCheckedChange={(checked) =>
                        toggle(group.write as Permission, checked === true)
                      }
                    />
                  ) : (
                    <span />
                  )}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>

          {scopes.includes("api_keys:write") ? (
            <FieldDescription>
              A token with <span className="font-mono">api_keys:write</span> can
              create more tokens.
            </FieldDescription>
          ) : null}
        </div>
      ) : null}
    </Field>
  )
}
