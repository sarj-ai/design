"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
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
import {
  KEYPAD_KEYS,
  TRANSFER_MODES,
  effectiveMode,
  overriddenFields,
  type Route,
  type SharedSettings,
  type TransferMode,
  type WorkingHours,
} from "@/lib/transfer-routing-data"
import { CaseField } from "@/components/transfer-routing/case-field"
import {
  DeleteRouteIcon,
  ExpandIcon,
  ReorderIcon,
  SetDefaultIcon,
} from "@/components/transfer-routing/icons"

/**
 * One route: where the call goes, why it goes there, and the key that skips
 * the asking. Below that, the four settings this route can take off the
 * shared block when it genuinely needs to differ.
 */
export function RouteCard({
  route,
  isDefault,
  shared,
  overlappingCases,
  hasOverlap,
  dragging,
  armed,
  settingsOpen,
  onChange,
  onDelete,
  onSetDefault,
  onArm,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  route: Route
  isDefault: boolean
  shared: SharedSettings
  overlappingCases: Set<string>
  hasOverlap: boolean
  dragging: boolean
  /** The grip is held, so this card is allowed to start a drag. */
  armed: boolean
  /** Start with the override panel expanded, so the state is visible on load. */
  settingsOpen: boolean
  onChange: (next: Route) => void
  onDelete: () => void
  onSetDefault: () => void
  onArm: (armed: boolean) => void
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
}) {
  const overrides = overriddenFields(route)
  const mode = effectiveMode(route, shared)

  function patch(next: Partial<Route>) {
    onChange({ ...route, ...next })
  }

  function patchOverride(next: Partial<Route["overrides"]>) {
    onChange({ ...route, overrides: { ...route.overrides, ...next } })
  }

  return (
    <Card
      draggable={armed}
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDrop={onDragEnd}
      onDragStart={onDragStart}
      className={cn(
        "gap-4",
        // The ring alone marks the card. Filling it too turned a third of the
        // drawer yellow for what is advice, not an error.
        hasOverlap && "ring-warning",
        dragging && "opacity-60",
      )}
    >
      <CardHeader className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Reorder ${route.name || "route"}`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={() => onArm(true)}
          onPointerUp={() => onArm(false)}
        >
          <ReorderIcon />
        </Button>

        <Input
          value={route.name}
          onChange={(event) => patch({ name: event.target.value })}
          placeholder="Route name"
          aria-label="Route name"
          className="max-w-50"
        />

        {isDefault ? (
          <Badge variant="secondary">Default</Badge>
        ) : (
          <Button variant="ghost" size="sm" onClick={onSetDefault}>
            <SetDefaultIcon />
            Set as default
          </Button>
        )}

        <div className="ms-auto">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            disabled={isDefault}
            aria-label={
              isDefault
                ? "The default route can't be deleted"
                : `Delete ${route.name || "route"}`
            }
            title={
              isDefault
                ? "The default route can't be deleted — set another route as default first."
                : undefined
            }
          >
            <DeleteRouteIcon />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <Field className="min-w-60 flex-1">
            <FieldLabel htmlFor={`${route.id}-destination`}>
              Destination number
            </FieldLabel>
            <Input
              id={`${route.id}-destination`}
              value={route.destination}
              onChange={(event) => patch({ destination: event.target.value })}
              placeholder="+966 11 000 0000"
            />
          </Field>

          <Field className="w-40">
            <FieldLabel htmlFor={`${route.id}-key`}>Keypad shortcut</FieldLabel>
            <Select
              value={route.keypadKey}
              onValueChange={(value) => patch({ keypadKey: value })}
            >
              <SelectTrigger id={`${route.id}-key`}>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {KEYPAD_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    Press {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldTitle>When to use this route</FieldTitle>
          <CaseField
            cases={route.cases}
            overlapping={overlappingCases}
            onAdd={(value) => patch({ cases: [...route.cases, value] })}
            onRemove={(value) =>
              patch({ cases: route.cases.filter((item) => item !== value) })
            }
          />
        </Field>

        <Collapsible defaultOpen={settingsOpen} className="flex flex-col gap-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-fit">
              <ExpandIcon className="transition-transform duration-200 ease-out-cubic group-aria-expanded/button:rotate-180 motion-reduce:transition-none" />
              Settings for this route
              {overrides.length ? (
                <Badge variant="secondary">{overrides.length} overridden</Badge>
              ) : (
                <span className="text-muted-foreground">using shared</span>
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="flex flex-col gap-4 rounded-lg bg-muted p-4">
            <OverrideRow
              title="Transfer mode"
              shared={
                TRANSFER_MODES.find(
                  (item) => item.value === shared.transferMode,
                )?.label ?? ""
              }
              overridden={route.overrides.transferMode !== null}
              onToggle={(on) =>
                patchOverride({ transferMode: on ? shared.transferMode : null })
              }
            >
              <Select
                value={route.overrides.transferMode ?? shared.transferMode}
                onValueChange={(value) =>
                  patchOverride({ transferMode: value as TransferMode })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFER_MODES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </OverrideRow>

            <OverrideRow
              title="Message before transferring"
              shared={shared.messageBeforeTransfer}
              overridden={route.overrides.messageBeforeTransfer !== null}
              onToggle={(on) =>
                patchOverride({
                  messageBeforeTransfer: on
                    ? shared.messageBeforeTransfer
                    : null,
                })
              }
            >
              <Textarea
                rows={2}
                value={route.overrides.messageBeforeTransfer ?? ""}
                onChange={(event) =>
                  patchOverride({ messageBeforeTransfer: event.target.value })
                }
              />
            </OverrideRow>

            <OverrideRow
              title="Working hours"
              shared={`${shared.workingHours.start}–${shared.workingHours.end}, and what plays outside them`}
              overridden={route.overrides.workingHours !== null}
              onToggle={(on) =>
                patchOverride({ workingHours: on ? shared.workingHours : null })
              }
            >
              <WorkingHoursFields
                value={route.overrides.workingHours ?? shared.workingHours}
                idPrefix={route.id}
                onChange={(workingHours) => patchOverride({ workingHours })}
              />
            </OverrideRow>

            {mode === "warm" ? (
              <OverrideRow
                title="Warm summary prompt"
                shared={shared.warmSummaryPrompt}
                overridden={route.overrides.warmSummaryPrompt !== null}
                onToggle={(on) =>
                  patchOverride({
                    warmSummaryPrompt: on ? shared.warmSummaryPrompt : null,
                  })
                }
              >
                <Textarea
                  rows={3}
                  value={route.overrides.warmSummaryPrompt ?? ""}
                  onChange={(event) =>
                    patchOverride({ warmSummaryPrompt: event.target.value })
                  }
                />
              </OverrideRow>
            ) : null}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

/**
 * One shared setting, with the switch that splits it off for this route.
 *
 * Switched off it shows what the route inherits, so nobody has to scroll down
 * to the shared block to find out what this route will actually do.
 */
function OverrideRow({
  title,
  shared,
  overridden,
  onToggle,
  children,
}: {
  title: string
  shared: string
  overridden: boolean
  onToggle: (on: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Field className="gap-3">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          {overridden ? null : (
            <FieldDescription>Shared — {shared}</FieldDescription>
          )}
        </FieldContent>
        <Switch
          checked={overridden}
          onCheckedChange={onToggle}
          aria-label={`Override ${title.toLowerCase()} for this route`}
        />
      </Field>
      {overridden ? children : null}
    </Field>
  )
}

/** Hours and the message that plays outside them — one unit, never split. */
export function WorkingHoursFields({
  value,
  idPrefix,
  onChange,
}: {
  value: WorkingHours
  idPrefix: string
  onChange: (next: WorkingHours) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field className="min-w-32 flex-1">
          <FieldLabel htmlFor={`${idPrefix}-start`}>Opens</FieldLabel>
          <Input
            id={`${idPrefix}-start`}
            type="time"
            value={value.start}
            onChange={(event) =>
              onChange({ ...value, start: event.target.value })
            }
          />
        </Field>
        <Field className="min-w-32 flex-1">
          <FieldLabel htmlFor={`${idPrefix}-end`}>Closes</FieldLabel>
          <Input
            id={`${idPrefix}-end`}
            type="time"
            value={value.end}
            onChange={(event) =>
              onChange({ ...value, end: event.target.value })
            }
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-outside`}>
          Outside-hours message
        </FieldLabel>
        <Textarea
          id={`${idPrefix}-outside`}
          rows={2}
          value={value.outsideHoursMessage}
          onChange={(event) =>
            onChange({ ...value, outsideHoursMessage: event.target.value })
          }
        />
      </Field>
    </div>
  )
}
