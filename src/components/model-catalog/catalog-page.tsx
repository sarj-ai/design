"use client"

import * as React from "react"

import { toast } from "sonner"

import { AddModelDialog } from "@/components/model-catalog/add-model-dialog"
import {
  AddModelIcon,
  LoadFailedIcon,
  ModelIcon,
  NoteIcon,
  RetryIcon,
  SearchIcon,
} from "@/components/model-catalog/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CATALOG,
  MODALITIES,
  canOnboard,
  providerById,
  type CatalogEntry,
  type Modality,
} from "@/lib/model-catalog-data"
import { cn } from "@/lib/utils"

/** The four states the reviewer switch in the mockup header moves between. */
export type CatalogState = "populated" | "empty" | "loading" | "error"

/**
 * The model catalog — DES-169, scoped to DIS-9.
 *
 * One table per modality, because LLM and TTS are two lists an admin reads
 * separately. Tabs rather than two routes: it is one surface with two views of
 * the same five columns.
 *
 * Only LLM can be onboarded here. TTS is activate-only, so its tab carries the
 * table and the row action and no Add button at all — see `canOnboard`.
 *
 * The page follows the closest thing bulbul already ships — the telephony
 * providers admin screen — which is a one-line description above a table whose
 * status column is a badge and whose row carries a single state-changing
 * action. Search and the status filter come from the Voice Library admin
 * screen, the other list this staff surface sits beside.
 */
export function ModelCatalogPage({ state }: { state: CatalogState }) {
  const [entries, setEntries] = React.useState<CatalogEntry[]>(CATALOG)
  const [modality, setModality] = React.useState<Modality>("llm")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [addOpen, setAddOpen] = React.useState(false)

  /**
   * Deactivating is one click and a quiet toast, as the PRD specifies.
   *
   * It takes the model out of future selection and touches nothing already
   * configured to it, so there is no consequence for a confirmation dialog to
   * warn about — a modal here would describe a risk that does not exist. The
   * undo in the toast is the recovery path instead. Reactivate is one click and
   * the same button styling for the same reason.
   */
  function toggleActive(entry: CatalogEntry) {
    const nowActive = !entry.active

    setEntries((previous) =>
      previous.map((item) =>
        item.id === entry.id ? { ...item, active: nowActive } : item,
      ),
    )

    toast(
      nowActive
        ? `${entry.displayName} is selectable again`
        : `${entry.displayName} removed from future selection`,
      {
        description: nowActive
          ? undefined
          : "Organizations already using it keep working.",
        action: {
          label: "Undo",
          onClick: () =>
            setEntries((previous) =>
              previous.map((item) =>
                item.id === entry.id ? { ...item, active: entry.active } : item,
              ),
            ),
        },
      },
    )
  }

  const filtersOn = search.trim() !== "" || statusFilter !== "all"

  return (
    <div className="flex flex-col gap-4">
      {/* The page had no title — breadcrumb ran straight into this line, so the
          description was doing an h1's job at a description's weight. One h1
          per page, and every sibling index page has one. */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Models</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Models Sarj staff have onboarded. Anything active here is selectable
          in every organization&apos;s settings.
        </p>
      </header>

      <Tabs
        className="gap-4"
        onValueChange={(value) => setModality(value as Modality)}
        value={modality}
      >
        <TabsList className="w-fit">
          {MODALITIES.map((option) => (
            <TabsTrigger key={option.id} value={option.id}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {MODALITIES.map((option) => {
          const all =
            state === "empty"
              ? []
              : entries.filter((entry) => entry.modality === option.id)

          const rows = all.filter((entry) => {
            if (statusFilter === "active" && !entry.active) return false
            if (statusFilter === "inactive" && entry.active) return false
            if (!search.trim()) return true
            const provider = providerById(entry.providerId)
            return `${entry.displayName} ${entry.modelId} ${provider?.name ?? ""}`
              .toLowerCase()
              .includes(search.trim().toLowerCase())
          })

          return (
            <TabsContent
              className="flex flex-col gap-3"
              key={option.id}
              value={option.id}
            >
              {/* Search and the action that adds to the table share one row,
                  its right edge against the table's — the same call as the
                  Knowledge Bases index.

                  They come and go separately, though. A search box over a list
                  that is loading, failed or empty is a control with no subject;
                  Add still has one, so only the filters go. */}
              {state === "populated" || canOnboard(option.id) ? (
                <div className="flex flex-wrap items-center gap-3">
                  {state === "populated" ? (
                    <>
                      <InputGroup className="max-w-64 bg-card">
                        <InputGroupAddon>
                          <SearchIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          aria-label="Search models"
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search models…"
                          value={search}
                        />
                      </InputGroup>

                      <Select
                        onValueChange={setStatusFilter}
                        value={statusFilter}
                      >
                        <SelectTrigger
                          aria-label="Filter by status"
                          className="bg-card"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Deactivated</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : null}

                  {/* `ms-auto` rather than justify-between: on a loading or
                      failed tab this button is the row's only child, and
                      justify-between would park it on the left. */}
                  {canOnboard(option.id) ? (
                    <Button
                      className="ms-auto"
                      onClick={() => setAddOpen(true)}
                    >
                      <AddModelIcon />
                      Add model
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <CatalogBody
                canAdd={canOnboard(option.id)}
                filtersOn={filtersOn}
                label={option.label}
                onAdd={() => setAddOpen(true)}
                onClearFilters={() => {
                  setSearch("")
                  setStatusFilter("all")
                }}
                onToggle={toggleActive}
                rows={rows}
                state={state}
              />
            </TabsContent>
          )
        })}
      </Tabs>

      <AddModelDialog
        modality={modality}
        onOpenChange={setAddOpen}
        open={addOpen}
      />
    </div>
  )
}

/**
 * Whichever of the table's states applies.
 *
 * Loading keeps the real header above skeleton rows so it reads as this table
 * arriving rather than as something unrelated. Empty, no-results and error each
 * name their own cause and carry the one action that resolves it — a catalog
 * that failed to load is not the same problem as a filter that matched nothing,
 * and one shared "nothing here" block would say neither.
 */
function CatalogBody({
  canAdd,
  filtersOn,
  label,
  onAdd,
  onClearFilters,
  onToggle,
  rows,
  state,
}: {
  canAdd: boolean
  filtersOn: boolean
  label: string
  onAdd: () => void
  onClearFilters: () => void
  onToggle: (entry: CatalogEntry) => void
  rows: CatalogEntry[]
  state: CatalogState
}) {
  if (state === "loading") {
    return (
      <Card className="[--card-spacing:0px]">
        <div className="overflow-x-auto">
          <Table>
            <CatalogHead />
            <TableBody>
              {Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-14 rounded-4xl" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ms-auto h-6 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    )
  }

  if (state === "error") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LoadFailedIcon />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load the catalog</EmptyTitle>
          <EmptyDescription>
            Nothing has changed — the list just didn&apos;t come back.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">
            <RetryIcon />
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (rows.length === 0 && filtersOn) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchIcon />
          </EmptyMedia>
          <EmptyTitle>No models match</EmptyTitle>
          <EmptyDescription>
            Nothing in the {label} catalog matches the filters you set.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onClearFilters} variant="outline">
            Clear filters
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ModelIcon />
          </EmptyMedia>
          <EmptyTitle>No {label} models yet</EmptyTitle>
          {/* The only place the missing Add button needs explaining. On a
              populated TTS tab the rows and their actions say what the screen
              does; on an empty one there would otherwise be nothing at all. */}
          <EmptyDescription>
            {canAdd
              ? "Add one and it becomes selectable for every organization on the platform."
              : "TTS models ship with the platform, so there is nothing to add here."}
          </EmptyDescription>
        </EmptyHeader>
        {canAdd ? (
          <EmptyContent>
            <Button onClick={onAdd}>
              <AddModelIcon />
              Add model
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    )
  }

  return (
    <Card className="[--card-spacing:0px]">
      <div className="overflow-x-auto">
        <Table>
          <CatalogHead />
          <TableBody>
            {rows.map((entry) => (
              <CatalogRow entry={entry} key={entry.id} onToggle={onToggle} />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

/** The PRD's five columns, in the PRD's order. */
function CatalogHead() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Provider</TableHead>
        <TableHead>Model</TableHead>
        <TableHead>Display name</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-end">
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

function CatalogRow({
  entry,
  onToggle,
}: {
  entry: CatalogEntry
  onToggle: (entry: CatalogEntry) => void
}) {
  const provider = providerById(entry.providerId)

  return (
    <TableRow className="transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none">
      <TableCell className="text-sm">{provider?.name ?? "—"}</TableCell>

      {/* The identifier sent to the provider verbatim, so it stays muted and
          reads as a value rather than as prose. */}
      <TableCell className="text-sm text-muted-foreground">
        {entry.modelId}
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              !entry.active && "text-muted-foreground",
            )}
          >
            {entry.displayName}
          </span>
          {/* Compatibility baggage a plain string cannot express — the PRD's
              one optional notes field, surfaced as an (i) rather than as a
              sentence in the row. */}
          {entry.notes ? (
            <Tooltip>
              <TooltipTrigger
                aria-label={`About ${entry.displayName}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <NoteIcon className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                {entry.notes}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </TableCell>

      <TableCell>
        {/* Deactivated is grey, not red. It is a routine state, not a failure,
            and colouring it as one would overstate the risk. */}
        <Badge
          className={cn(
            entry.active
              ? "bg-success-tint text-success-tint-foreground"
              : "text-muted-foreground",
          )}
          variant="secondary"
        >
          {entry.active ? "Active" : "Deactivated"}
        </Badge>
      </TableCell>

      <TableCell className="text-end">
        {/* One click, per the PRD, and the same styling in both directions —
            neither taking a model out of selection nor putting it back is the
            destructive action a red button would imply. */}
        <Button onClick={() => onToggle(entry)} size="xs" variant="outline">
          {entry.active ? "Deactivate" : "Reactivate"}
        </Button>
      </TableCell>
    </TableRow>
  )
}
