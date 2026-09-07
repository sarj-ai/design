"use client"

import * as React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  COLLECTED_OPTIONS,
  INITIAL_COLLECTED,
  INITIAL_STANDARD,
  INITIAL_VARIABLES,
  STANDARD_OPTIONS,
  TEMPLATES,
  VARIABLE_OPTIONS,
  type Column,
} from "@/lib/configure-report-data"
import { ColumnChips } from "@/components/configure-report/column-chips"
import { ColumnPicker } from "@/components/configure-report/column-picker"
import { BackgroundTaskIcon } from "@/components/configure-report/icons"

/**
 * Configure Report — the approved design from DES-155, as PROD-289 asks for.
 *
 * Three groups of columns down the dialog, each a set of removable chips: the
 * standard ones that always ship, then the custom ones split into the values
 * passed into the call and the values the agent gathered during it. The
 * template row sits above all of them because picking one rewrites everything
 * below.
 *
 * Each group's Add opens a checkbox list of everything that group can hold,
 * ticked where the report already has it — so a group is filled in one pass
 * instead of one column per reopen.
 */
export function ConfigureReportDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const [template, setTemplate] = React.useState("default")
  const [standard, setStandard] = React.useState<Column[]>(INITIAL_STANDARD)
  const [variables, setVariables] = React.useState<Column[]>(INITIAL_VARIABLES)
  const [collected, setCollected] = React.useState<Column[]>(INITIAL_COLLECTED)

  const drop = (id: string) => (columns: Column[]) =>
    columns.filter((column) => column.id !== id)

  /** Lift one chip out and drop it back in at the new index. */
  const reorder = (from: number, to: number) => (columns: Column[]) => {
    const next = [...columns]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {/* Nothing is autofocused: the design shows the dialog at rest, and the
          template select picking up a focus ring on open is the one difference
          a reviewer would read as a styling change. */}
      {/* The body is the only row that scrolls, so the header and the footer
          stay put and the dialog never grows past the viewport. `1fr` with
          `min-h-0` on the body is what lets it take the space that is left
          instead of a fixed slice of the screen — a fixed slice clipped the
          note at the bottom on shorter windows. */}
      <DialogContent
        className="grid-rows-[auto_1fr_auto] max-h-[85vh] sm:max-w-2xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Configure Report</DialogTitle>
          <DialogDescription>
            Choose what to include before generating the report.
          </DialogDescription>
        </DialogHeader>

        {/* The ±1 pair gives focus rings room to draw inside the scroll box. */}
        <div className="-mx-1 flex min-h-0 flex-col gap-6 overflow-y-auto px-1 pb-1">
          <section className="flex flex-col gap-3">
            <h3 className="text-base font-medium">Template</h3>

            <div className="flex flex-wrap items-center gap-2">
              <Select onValueChange={setTemplate} value={template}>
                <SelectTrigger aria-label="Template" className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="ms-auto" variant="outline">
                Save as template
              </Button>
              <Button variant="outline">Set as default</Button>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-base font-medium">Standard Columns</h3>
                <p className="text-sm text-muted-foreground">
                  Included by default in every export.
                </p>
              </div>

              <div className="ms-auto">
                <ColumnPicker
                  emptyLabel="No matching column."
                  onChange={setStandard}
                  options={STANDARD_OPTIONS}
                  placeholder="Search standard columns…"
                  selected={standard}
                />
              </div>
            </div>

            <ColumnChips
              columns={standard}
              onRemove={(id) => setStandard(drop(id))}
              onReorder={(from, to) => setStandard(reorder(from, to))}
            />
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-medium">Custom Columns</h3>
              <p className="text-sm text-muted-foreground">
                Included by default in every export.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-base text-muted-foreground">Variables</h4>
                <div className="ms-auto">
                  <ColumnPicker
                    emptyLabel="No matching variable."
                    onChange={setVariables}
                    options={VARIABLE_OPTIONS}
                    placeholder="Search variables…"
                    selected={variables}
                  />
                </div>
              </div>
              <ColumnChips
                columns={variables}
                onRemove={(id) => setVariables(drop(id))}
                onReorder={(from, to) => setVariables(reorder(from, to))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-base text-muted-foreground">
                  Collected Data
                </h4>
                <div className="ms-auto">
                  <ColumnPicker
                    emptyLabel="No matching field."
                    onChange={setCollected}
                    options={COLLECTED_OPTIONS}
                    placeholder="Search collected data…"
                    selected={collected}
                  />
                </div>
              </div>
              <ColumnChips
                columns={collected}
                onRemove={(id) => setCollected(drop(id))}
                onReorder={(from, to) => setCollected(reorder(from, to))}
              />
            </div>
          </section>

          <Alert>
            <BackgroundTaskIcon />
            <AlertDescription>
              Your report will be generated as a background task and you&apos;ll
              be notified when it&apos;s ready for download.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Generate Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
