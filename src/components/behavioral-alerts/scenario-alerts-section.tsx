"use client"

import * as React from "react"

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
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Switch } from "@/components/ui/switch"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { cn } from "@/lib/utils"
import type { ConfiguredAlert } from "@/lib/behavioral-alerts-data"
import { AlertFormDialog } from "@/components/behavioral-alerts/alert-form-dialog"
import {
  AddAlertIcon,
  FlagsIcon,
  DeleteAlertIcon,
  EditAlertIcon,
  RowMenuIcon,
} from "@/components/behavioral-alerts/icons"
import { PriorityBadge } from "@/components/behavioral-alerts/severity"

/**
 * The Call flags section on the scenario's Configuration tab, sitting
 * where Data extraction and Record sinks already sit — one card per thing the
 * scenario asks the post-call pipeline to do.
 *
 * A table rather than a card per alert: name, priority and on/off are three
 * short values that a client reads down a column to answer "what am I watching
 * for", and five cards each holding one sentence is a list in a costume.
 *
 * The whole row opens the alert, not just its name. A row that is clickable
 * only on one word is a row you have to aim at.
 */
export function ScenarioAlertsSection({
  alerts,
  onAlertsChange,
}: {
  alerts: ConfiguredAlert[]
  onAlertsChange: (alerts: ConfiguredAlert[]) => void
}) {
  const [editing, setEditing] = React.useState<ConfiguredAlert | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState<ConfiguredAlert | null>(null)
  /* Bumped on every open so the form remounts and seeds its draft from props.
     Editing the same alert twice has to start from the saved values both
     times, which a key on the alert's own id would not give. */
  const [formKey, setFormKey] = React.useState(0)
  /* The scenario either asks the post-call analyst to watch for flags or it
     does not, which is one switch above the list rather than five switches all
     turned off. Local, because it is this card's own setting — a call's
     analysis is already recorded and does not change when it flips. */
  const [watching, setWatching] = React.useState(true)

  function openNew() {
    setEditing(null)
    setFormKey((current) => current + 1)
    setFormOpen(true)
  }

  function openEdit(alert: ConfiguredAlert) {
    setEditing(alert)
    setFormKey((current) => current + 1)
    setFormOpen(true)
  }

  function save(alert: ConfiguredAlert) {
    onAlertsChange(
      alerts.some((item) => item.id === alert.id)
        ? alerts.map((item) => (item.id === alert.id ? alert : item))
        : [...alerts, alert],
    )
    setFormOpen(false)
  }

  function setEnabled(id: string, enabled: boolean) {
    onAlertsChange(
      alerts.map((item) => (item.id === id ? { ...item, enabled } : item)),
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          {/* Icon beside the title, the way every other section on the
              scenario page carries one. */}
          <CardTitle className="flex items-center gap-3">
            <FlagsIcon className="size-5 shrink-0" />
            Call flags
          </CardTitle>
          <CardDescription>
            Patterns the post-call analyst looks for in every transcript on this
            scenario.
          </CardDescription>
          <CardAction className="flex items-center gap-3">
            <Button
              disabled={!watching}
              onClick={openNew}
              size="sm"
              variant="outline"
            >
              <AddAlertIcon />
              Add flag
            </Button>
            <Switch
              aria-label="Watch for call flags on this scenario"
              checked={watching}
              onCheckedChange={setWatching}
            />
          </CardAction>
        </CardHeader>

        <CardContent>
          {alerts.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FlagsIcon />
                </EmptyMedia>
                <EmptyTitle>No flags on this scenario</EmptyTitle>
                <EmptyDescription>
                  Calls still get a caller experience card. Add a flag to watch
                  for a pattern on top of it.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button disabled={!watching} onClick={openNew}>
                  <AddAlertIcon />
                  Add flag
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ItemGroup className="gap-3">
              {alerts.map((alert) => (
                <Item
                  className={cn(
                    "items-start",
                    watching && "cursor-pointer hover:bg-muted/50",
                  )}
                  key={alert.id}
                  onClick={
                    watching
                      ? () => {
                          openEdit(alert)
                        }
                      : undefined
                  }
                  variant="outline"
                >
                  <ItemContent>
                    <ItemTitle className="flex-wrap gap-2">
                      {/* A paused flag keeps its definition and loses its
                          emphasis — the switch says it is off, the weight says
                          it stopped mattering to this list. */}
                      <span
                        className={cn(
                          (!watching || !alert.enabled) &&
                            "text-muted-foreground",
                        )}
                      >
                        {alert.name}
                      </span>
                      <PriorityBadge priority={alert.priority} />
                    </ItemTitle>
                    <ItemDescription>{alert.description}</ItemDescription>
                  </ItemContent>

                  <ItemActions
                    onClick={(event) => {
                      event.stopPropagation()
                    }}
                  >
                    <Switch
                      aria-label={`${alert.name} enabled`}
                      checked={alert.enabled}
                      disabled={!watching}
                      onCheckedChange={(checked) => {
                        setEnabled(alert.id, checked)
                      }}
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label={`Actions for ${alert.name}`}
                          disabled={!watching}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <RowMenuIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            openEdit(alert)
                          }}
                        >
                          <EditAlertIcon />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleting(alert)
                          }}
                          variant="destructive"
                        >
                          <DeleteAlertIcon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>

      <AlertFormDialog
        alert={editing}
        key={formKey}
        onOpenChange={setFormOpen}
        onSave={save}
        open={formOpen}
      />

      {/* Deleting throws the definition away and the detections already made
          against it stop having anything to name them. Pausing is the reason
          this dialog can offer a second way out rather than only a cancel. */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        open={deleting !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Calls already analysed keep their detections. To stop detecting it
              without losing the definition, turn it off instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleting) return
                onAlertsChange(alerts.filter((item) => item.id !== deleting.id))
                setDeleting(null)
              }}
              variant="destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
