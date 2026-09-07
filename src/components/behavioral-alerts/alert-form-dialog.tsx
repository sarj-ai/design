"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
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
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  type AlertPriority,
  type ConfiguredAlert,
} from "@/lib/behavioral-alerts-data"

const DESCRIPTION_LIMIT = 500

/**
 * Adding or editing one alert. Four fields, which is the whole definition — the
 * PRD's target is a client defining their own alerts in under two minutes.
 *
 * No helper text under any of them. Description is the one field whose job is
 * not obvious from its label, and a placeholder showing a real alert does that
 * better than a sentence explaining it would: the format is the example.
 */
export function AlertFormDialog({
  alert,
  onOpenChange,
  onSave,
  open,
}: {
  /** The alert being edited, or null when this is a new one. */
  alert: ConfiguredAlert | null
  onOpenChange: (open: boolean) => void
  onSave: (alert: ConfiguredAlert) => void
  open: boolean
}) {
  /* Seeded once, from whichever alert is being edited. The parent remounts this
     component every time it opens it — see the `key` on the call site — so the
     draft is fresh without an effect copying props into state on every open. */
  const [name, setName] = React.useState(alert?.name ?? "")
  const [description, setDescription] = React.useState(alert?.description ?? "")
  const [priority, setPriority] = React.useState<AlertPriority>(
    alert?.priority ?? "medium",
  )
  const [enabled, setEnabled] = React.useState(alert?.enabled ?? true)

  const complete = name.trim().length > 0 && description.trim().length > 0

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{alert ? "Edit flag" : "Add flag"}</DialogTitle>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="alert-name">Name</FieldLabel>
          <Input
            id="alert-name"
            onChange={(event) => {
              setName(event.target.value)
            }}
            placeholder="Escalation request"
            value={name}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="alert-description">Description</FieldLabel>
          <Textarea
            id="alert-description"
            maxLength={DESCRIPTION_LIMIT}
            onChange={(event) => {
              setDescription(event.target.value)
            }}
            placeholder="The caller asks to speak to a manager, a supervisor, or a human agent."
            rows={4}
            value={description}
          />
          <span className="text-xs text-muted-foreground tabular-nums">
            {description.length} / {DESCRIPTION_LIMIT}
          </span>
        </Field>

        <Field>
          <FieldLabel htmlFor="alert-priority">Priority</FieldLabel>
          <Select
            onValueChange={(value) => {
              setPriority(value as AlertPriority)
            }}
            value={priority}
          >
            <SelectTrigger id="alert-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_ORDER.map((level) => (
                <SelectItem key={level} value={level}>
                  {PRIORITY_LABELS[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field orientation="horizontal">
          <FieldLabel htmlFor="alert-enabled">Enabled</FieldLabel>
          <Switch
            checked={enabled}
            id="alert-enabled"
            onCheckedChange={setEnabled}
          />
        </Field>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!complete}
            onClick={() => {
              onSave({
                id: alert?.id ?? `alert-${name.trim().toLowerCase()}`,
                name: name.trim(),
                description: description.trim(),
                priority,
                enabled,
              })
            }}
          >
            {alert ? "Save changes" : "Add flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
