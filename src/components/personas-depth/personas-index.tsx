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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  GENDERS,
  LANGUAGES,
  PERSONAS,
  voiceById,
  type Persona,
} from "@/lib/personas-depth-data"
import {
  AddPersonaIcon,
  DeleteIcon,
  EditIcon,
  LoadErrorIcon,
  MakeDefaultIcon,
  NoPersonasIcon,
  PlayPreviewIcon,
  RetryIcon,
  RowMenuIcon,
  ScenariosIcon,
  SearchIcon,
  StopPreviewIcon,
} from "@/components/personas-depth/icons"
import {
  PersonaDialog,
  type PersonaDraft,
} from "@/components/personas-depth/persona-dialog"
import { PersonaWizard } from "@/components/personas-depth/persona-wizard"
import { ScenarioAssignmentDialog } from "@/components/personas-depth/scenario-assignment-dialog"

/** Which of the ticket's edge states the reviewer is looking at. */
export type PreviewState = "data" | "loading" | "empty" | "error"

type GroupBy = "none" | "language" | "gender"

const COLUMN_COUNT = 6

export function PersonasIndex({ state }: { state: PreviewState }) {
  const [personas, setPersonas] = React.useState<Persona[]>(PERSONAS)
  const [search, setSearch] = React.useState("")
  const [languageFilter, setLanguageFilter] = React.useState("all")
  const [genderFilter, setGenderFilter] = React.useState("all")
  const [groupBy, setGroupBy] = React.useState<GroupBy>("none")
  const [playingId, setPlayingId] = React.useState<string | null>(null)

  const [wizardOpen, setWizardOpen] = React.useState(false)
  const [editorOpen, setEditorOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Persona | null>(null)
  const [scenariosFor, setScenariosFor] = React.useState<Persona | null>(null)
  const [deleting, setDeleting] = React.useState<Persona | null>(null)

  const filtered = personas.filter((persona) => {
    if (languageFilter !== "all" && persona.language !== languageFilter)
      return false
    if (genderFilter !== "all" && persona.gender !== genderFilter) return false
    if (search && !persona.name.toLowerCase().includes(search.toLowerCase()))
      return false
    return true
  })

  const filtersActive =
    search !== "" || languageFilter !== "all" || genderFilter !== "all"

  const groups: { label: string | null; rows: Persona[] }[] =
    groupBy === "none"
      ? [{ label: null, rows: filtered }]
      : (groupBy === "language" ? LANGUAGES : GENDERS)
          .map((key) => ({
            label: key as string,
            rows: filtered.filter((persona) =>
              groupBy === "language"
                ? persona.language === key
                : persona.gender === key,
            ),
          }))
          .filter((group) => group.rows.length > 0)

  function openCreate() {
    setWizardOpen(true)
  }

  function openEdit(persona: Persona) {
    setEditing(persona)
    setEditorOpen(true)
  }

  function createDraft(draft: PersonaDraft) {
    setPersonas((previous) => [
      ...previous,
      {
        ...draft,
        id: `p-new-${previous.length + 1}`,
        isDefault: false,
        scenarioIds: [],
        createdAt: "Aug 16, 2026",
      },
    ])
  }

  function submitDraft(draft: PersonaDraft) {
    if (editing) {
      setPersonas((previous) =>
        previous.map((persona) =>
          persona.id === editing.id ? { ...persona, ...draft } : persona,
        ),
      )
    } else {
      createDraft(draft)
    }
  }

  function setDefault(target: Persona) {
    setPersonas((previous) =>
      previous.map((persona) =>
        persona.language === target.language
          ? { ...persona, isDefault: persona.id === target.id }
          : persona,
      ),
    )
  }

  function changeScenarios(personaId: string, scenarioIds: string[]) {
    setPersonas((previous) =>
      previous.map((persona) =>
        persona.id === personaId ? { ...persona, scenarioIds } : persona,
      ),
    )
    setScenariosFor((previous) =>
      previous && previous.id === personaId
        ? { ...previous, scenarioIds }
        : previous,
    )
  }

  function confirmDelete() {
    if (!deleting) return
    setPersonas((previous) =>
      previous.filter((persona) => persona.id !== deleting.id),
    )
    setDeleting(null)
  }

  /**
   * The same shape as the empty state below — centred in the content area, icon
   * over title over description, one action underneath. Both are "there is no
   * table to show you and here is what to do about it", and an alert pinned to
   * the top of an otherwise blank page read as a notice about a page that was
   * still coming.
   *
   * The tint carries the difference the layout no longer does: `destructive` on
   * the icon says this is a failure, where the empty state's icon is muted.
   */
  if (state === "error") {
    return (
      <Empty>
        <EmptyHeader className="max-w-xs">
          <EmptyMedia
            className="bg-destructive-tint text-destructive-tint-foreground"
            variant="icon"
          >
            <LoadErrorIcon />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load personas</EmptyTitle>
          <EmptyDescription>
            Something went wrong fetching this list. Live calls are unaffected —
            scenarios keep the personas they already have.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">
            <RetryIcon />
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (state === "empty") {
    return (
      <>
        <Empty>
          <EmptyHeader className="max-w-xs">
            <EmptyMedia variant="icon">
              <NoPersonasIcon />
            </EmptyMedia>
            <EmptyTitle>No personas yet</EmptyTitle>
            <EmptyDescription>
              Personas define the voice and behavior for your calls. Create one
              per language you call in — the first becomes that language&apos;s
              default.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={openCreate}>
              <AddPersonaIcon />
              New persona
            </Button>
          </EmptyContent>
        </Empty>

        <PersonaWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          onSubmit={createDraft}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* `bg-card` and no `size="sm"` on any of the four, so the filter row
              matches the Conversations one: every control 32px on a card
              surface. It was a 32px search beside three 28px selects, all
              transparent — same controls, two heights, no surface. */}
          <InputGroup className="max-w-64 bg-card">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search personas…"
              aria-label="Search personas"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>

          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="bg-card" aria-label="Filter by language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {LANGUAGES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="bg-card" aria-label="Filter by gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genders</SelectItem>
              {GENDERS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={groupBy}
            onValueChange={(value) => setGroupBy(value as GroupBy)}
          >
            <SelectTrigger className="bg-card" aria-label="Group personas">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No grouping</SelectItem>
              <SelectItem value="language">Group by language</SelectItem>
              <SelectItem value="gender">Group by gender</SelectItem>
            </SelectContent>
          </Select>

          {filtersActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setLanguageFilter("all")
                setGenderFilter("all")
              }}
            >
              Clear
            </Button>
          ) : null}

          {/* Default size, not `sm`: this sits inline with the search and the
              three selects, all of which are 32px, so a 28px button read as
              undersized next to them. Conversations gets away with 28px for
              Export and Refresh because those live in their own group at the
              far end of the row, not in the filter run. */}
          <Button className="ms-auto" onClick={openCreate}>
            <AddPersonaIcon />
            New persona
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {state === "loading"
            ? "Loading…"
            : filtersActive
              ? `${filtered.length} of ${personas.length} personas`
              : `${personas.length} personas`}
        </div>

        {/* --card-spacing: 0 lets the table reach the card's edges — the
            header band and row rules do the framing. */}
        <Card className="[--card-spacing:0px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground">
                    Persona
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Voice
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Language
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Scenarios
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Created
                  </TableHead>
                  <TableHead className="text-end font-semibold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {state === "loading" ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="ms-auto h-4 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMN_COUNT}>
                      <div className="flex flex-col items-center gap-2 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No personas match these filters.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearch("")
                            setLanguageFilter("all")
                            setGenderFilter("all")
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => (
                    <React.Fragment key={group.label ?? "all"}>
                      {group.label ? (
                        <TableRow className="hover:bg-transparent">
                          <TableCell
                            colSpan={COLUMN_COUNT}
                            className="bg-muted/50 py-2 text-xs font-medium text-muted-foreground"
                          >
                            {group.label} · {group.rows.length}
                          </TableCell>
                        </TableRow>
                      ) : null}

                      {group.rows.map((persona) => {
                        const voice = voiceById(persona.voiceId)
                        const playing = playingId === persona.voiceId
                        const scenarioCount = persona.scenarioIds.length

                        return (
                          <TableRow
                            key={persona.id}
                            /* Row height is set by the tallest control in it,
                               not by the cell padding — that is already the 8px
                               Conversations uses. `icon-xs` (24px) rather than
                               `icon-sm` (28px) on the three row buttons is what
                               brings these rows down to the Conversations
                               density instead of running 6px taller. */
                            className="transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {persona.name}
                                </span>
                                {persona.isDefault ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      {/* The tint, not solid `primary`. Every
                                          chip on the Conversations table is a
                                          near-white fill with its own dark
                                          foreground — `primary-tint` is exactly
                                          what it uses for its brand-toned chip.
                                          Solid primary at 19% lightness made
                                          this the heaviest thing in a row where
                                          the persona's name is what matters. */}
                                      <Badge
                                        variant="secondary"
                                        className="bg-primary-tint text-primary-tint-foreground"
                                      >
                                        Default
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Default for {persona.language} — used when
                                      a scenario has no explicit persona
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null}
                              </div>
                            </TableCell>

                            <TableCell>
                              {/* One control, not a loose icon beside loose
                                  text. The play button and the voice name are
                                  the same thing — press it, hear that voice —
                                  so ButtonGroup joins them on a shared edge and
                                  radius. `outline` rather than `ghost` because
                                  a group needs a border to share; a ghost
                                  button has a transparent one and the seam
                                  disappears. */}
                              <ButtonGroup>
                                <Button
                                  variant="outline"
                                  size="icon-xs"
                                  aria-label={
                                    playing
                                      ? `Stop ${voice?.name} sample`
                                      : `Play ${voice?.name} sample`
                                  }
                                  onClick={() =>
                                    setPlayingId(
                                      playing ? null : persona.voiceId,
                                    )
                                  }
                                >
                                  {playing ? (
                                    <StopPreviewIcon />
                                  ) : (
                                    <PlayPreviewIcon />
                                  )}
                                </Button>
                                {/* ButtonGroupText ships without a `data-slot`,
                                    and ButtonGroup's `rounded-r-lg!` rule
                                    targets the last child that has one. With
                                    the text invisible to that selector the
                                    button matched it instead and had its right
                                    corners forced back round, so the two read
                                    as separate pills touching. Supplying the
                                    attribute here fixes it without editing a
                                    generated primitive. */}
                                <ButtonGroupText data-slot="button-group-text">
                                  {voice?.name ?? "—"}
                                </ButtonGroupText>
                              </ButtonGroup>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="bg-muted text-muted-foreground"
                              >
                                {persona.language}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="-ms-2"
                                onClick={() => setScenariosFor(persona)}
                              >
                                {scenarioCount > 0
                                  ? `${scenarioCount} ${
                                      scenarioCount === 1
                                        ? "scenario"
                                        : "scenarios"
                                    }`
                                  : "Assign"}
                              </Button>
                            </TableCell>

                            <TableCell className="text-muted-foreground">
                              {persona.createdAt}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label={`Edit ${persona.name}`}
                                  onClick={() => openEdit(persona)}
                                >
                                  <EditIcon />
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      aria-label={`More actions for ${persona.name}`}
                                    >
                                      <RowMenuIcon />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  {/* The primitive pins content width to the
                                  trigger — a 28px icon here — so widen it. */}
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-auto min-w-44"
                                  >
                                    {!persona.isDefault ? (
                                      <DropdownMenuItem
                                        onClick={() => setDefault(persona)}
                                      >
                                        <MakeDefaultIcon />
                                        Set as default
                                      </DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuItem
                                      onClick={() => setScenariosFor(persona)}
                                    >
                                      <ScenariosIcon />
                                      Manage scenarios
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {persona.isDefault ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          {/* Disabled items swallow pointer events,
                                          so the tooltip hangs off a wrapper. */}
                                          <div>
                                            <DropdownMenuItem
                                              variant="destructive"
                                              disabled
                                            >
                                              <DeleteIcon />
                                              Delete
                                            </DropdownMenuItem>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Set another {persona.language} default
                                          first — the default can&apos;t be
                                          deleted
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => setDeleting(persona)}
                                      >
                                        <DeleteIcon />
                                        Delete
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <PersonaDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        persona={editing}
        onSubmit={submitDraft}
      />

      <PersonaWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSubmit={createDraft}
      />

      <ScenarioAssignmentDialog
        persona={scenariosFor}
        onOpenChange={(open) => {
          if (!open) setScenariosFor(null)
        }}
        onChangeScenarios={changeScenarios}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.scenarioIds.length
                ? `${deleting.scenarioIds.length} ${
                    deleting.scenarioIds.length === 1
                      ? "scenario falls"
                      : "scenarios fall"
                  } back to the ${deleting?.language} default persona. `
                : ""}
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete persona
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
