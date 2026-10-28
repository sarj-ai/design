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
} from "@/lib/mockups/behavioral-alerts-data"

const DESCRIPTION_LIMIT = 500

export function AlertFormDialog({
  alert,
  onOpenChange,
  onSave,
  open,
}: {
  alert: ConfiguredAlert | null
  onOpenChange: (open: boolean) => void
  onSave: (alert: ConfiguredAlert) => void
  open: boolean
}) {
  // Seeded once: the parent remounts this on every open (see `key` at the call
  // site).
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
            <SelectContent position="popper">
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
