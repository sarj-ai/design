"use client"

import * as React from "react"
import { toast } from "sonner"

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
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LanguageChip, NotApplicable } from "@/components/design-system/call-table"
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import { ChoiceFilter, FilterBar } from "@/components/shared/filter-bar"
import { ListFooter } from "@/components/shared/list-footer"
import { PageHeader } from "@/components/shared/page-header"
import { usePlayback } from "@/components/mockups/voice-cloning/audio"
import {
  ActiveVoiceIcon,
  AddVoiceIcon,
  DeleteVoiceIcon,
  EditVoiceIcon,
  PauseVoiceIcon,
  PlayVoiceIcon,
  RecordIcon,
  SearchVoicesIcon,
} from "@/components/mockups/voice-cloning/icons"
import {
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  type Viewer,
  type Voice,
  type VoiceStatus,
} from "@/lib/mockups/voice-cloning-data"

/**
 * `/admin/voices` as the platform ships it on the index-page revamp branch —
 * search with the page's actions at its end, filter chips under it, the same
 * eight columns — plus what DES-198 adds:
 *
 *  - Clone voice beside Add voice, two buttons and not a chooser (PRD). Clone
 *    leads: it is the one every user has. Add voice registers an external
 *    voice by provider ID, an engineer's task, so a client organization does
 *    not see it.
 *  - Pending, the third status the PRD asks for: a Sarj voice whose request
 *    to be offered to every organization is waiting on approval.
 *  - Delete, only on cloned voices. A native voice cannot be deleted, so the
 *    button is absent there rather than disabled.
 */

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
]

const PROVIDER_OPTIONS = ["Sarj Omni", "ElevenLabs", "Hamsa", "Cartesia"].map(
  (provider) => ({ value: provider, label: provider }),
)

export function VoiceLibrary({
  viewer,
  voices,
  onClone,
  onDelete,
}: {
  viewer: Viewer
  voices: Voice[]
  onClone: () => void
  onDelete: (voice: Voice) => void
}) {
  const [query, setQuery] = React.useState("")
  const [provider, setProvider] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string | null>(null)
  const [language, setLanguage] = React.useState<string | null>(null)
  const [gender, setGender] = React.useState<string | null>(null)
  const [pageSize, setPageSize] = React.useState(25)
  const [deleting, setDeleting] = React.useState<Voice | null>(null)

  const rows = voices.filter(
    (voice) =>
      voice.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (provider === null || voice.provider === provider) &&
      (status === null || voice.status === status) &&
      (language === null || voice.language === language) &&
      (gender === null || voice.gender === gender),
  )
  const activeCount = [provider, status, language, gender].filter(
    (value) => value !== null,
  ).length

  return (
    <main className="mx-auto flex w-full max-w-350 flex-col gap-4 p-8">
      <PageHeader title="Voice library" />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="min-w-64 flex-1">
            <InputGroupAddon>
              <SearchVoicesIcon />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search voices by name"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name..."
              value={query}
            />
          </InputGroup>
          <div className="flex items-center gap-2">
            {viewer === "sarj" ? (
              <Button variant="outline">
                <AddVoiceIcon />
                Add voice
              </Button>
            ) : null}
            <Button onClick={onClone}>
              <RecordIcon />
              Clone voice
            </Button>
          </div>
        </div>

        <FilterBar
          activeCount={activeCount}
          onClearAll={() => {
            setProvider(null)
            setStatus(null)
            setLanguage(null)
            setGender(null)
          }}
        >
          <ChoiceFilter
            field="Provider"
            onChange={setProvider}
            options={PROVIDER_OPTIONS}
            value={provider}
          />
          <ChoiceFilter
            field="Status"
            onChange={setStatus}
            options={STATUS_OPTIONS}
            value={status}
          />
          <ChoiceFilter
            field="Language"
            onChange={setLanguage}
            options={LANGUAGE_OPTIONS}
            value={language}
          />
          <ChoiceFilter
            field="Gender"
            onChange={setGender}
            options={GENDER_OPTIONS}
            value={gender}
          />
        </FilterBar>
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {query.trim()
                ? `No voices match “${query.trim()}”`
                : "No voices match these filters"}
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable>
            <TableHeader>
              <DataTableHeaderRow>
                <DataTableHead>Display name</DataTableHead>
                <DataTableHead>Vibe</DataTableHead>
                <DataTableHead>Provider</DataTableHead>
                <DataTableHead>Language</DataTableHead>
                <DataTableHead>Gender</DataTableHead>
                <DataTableHead>Status</DataTableHead>
                <DataTableHead className="text-end">Test</DataTableHead>
                <DataTableHead className="text-end">
                  <span className="sr-only">Actions</span>
                </DataTableHead>
              </DataTableHeaderRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, pageSize).map((voice) => (
                <VoiceRow
                  key={voice.id}
                  onDelete={() => setDeleting(voice)}
                  voice={voice}
                />
              ))}
            </TableBody>
          </DataTable>

          <ListFooter
            from={1}
            noun="voices"
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
            shown={Math.min(rows.length, pageSize)}
            total={rows.length}
            atEnd
          />
        </div>
      )}

      <DeleteVoiceConfirm
        onConfirm={(voice) => {
          onDelete(voice)
          toast(`${voice.name} deleted`)
        }}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        voice={deleting}
      />
    </main>
  )
}

function VoiceRow({ voice, onDelete }: { voice: Voice; onDelete: () => void }) {
  const playback = usePlayback(3)

  return (
    <TableRow>
      <TableCell className="font-medium" dir="auto">
        {voice.name}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {voice.vibe ? <span dir="auto">{voice.vibe}</span> : <NotApplicable />}
      </TableCell>
      <TableCell className="text-muted-foreground">{voice.provider}</TableCell>
      <TableCell>
        <LanguageChip languages={[voice.language.toUpperCase()]} />
      </TableCell>
      <TableCell className="text-muted-foreground capitalize">
        {voice.gender}
      </TableCell>
      <TableCell>
        <StatusChip status={voice.status} />
      </TableCell>
      <TableCell className="py-1.5 text-end">
        <Button
          aria-label={
            playback.playing
              ? `Stop ${voice.name} sample`
              : `Play ${voice.name} sample`
          }
          onClick={playback.toggle}
          size="icon-sm"
          variant="ghost"
        >
          {playback.playing ? <PauseVoiceIcon /> : <PlayVoiceIcon />}
        </Button>
      </TableCell>
      <TableCell className="py-1.5 text-end">
        <span className="flex items-center justify-end gap-1">
          <Button aria-label={`Edit ${voice.name}`} size="icon-sm" variant="ghost">
            <EditVoiceIcon />
          </Button>
          {voice.cloned ? (
            <Button
              aria-label={`Delete ${voice.name}`}
              onClick={onDelete}
              size="icon-sm"
              variant="ghost"
            >
              <DeleteVoiceIcon />
            </Button>
          ) : (
            /* Holds the column so edit buttons line up down the table. */
            <span aria-hidden className="size-7" />
          )}
        </span>
      </TableCell>
    </TableRow>
  )
}

/** The platform's Active and Inactive chips, and the new Pending. */
function StatusChip({ status }: { status: VoiceStatus }) {
  if (status === "active") {
    return (
      <Badge
        className="bg-success-tint text-success-tint-foreground"
        variant="secondary"
      >
        <ActiveVoiceIcon />
        Active
      </Badge>
    )
  }
  if (status === "pending") {
    return (
      <Badge
        className="bg-warning-tint text-warning-tint-foreground"
        variant="secondary"
      >
        Pending
      </Badge>
    )
  }
  return (
    <Badge className="bg-muted text-muted-foreground" variant="secondary">
      Inactive
    </Badge>
  )
}

/**
 * Deleting a clone is final — the reference audio is not kept, so it cannot
 * be cloned back. That makes it a confirm, not an undo toast. A voice a
 * persona still speaks with is not deletable at all: the confirm names those
 * personas and offers no Delete until they have switched.
 */
function DeleteVoiceConfirm({
  voice,
  onOpenChange,
  onConfirm,
}: {
  voice: Voice | null
  onOpenChange: (open: boolean) => void
  onConfirm: (voice: Voice) => void
}) {
  /* Keeps the last voice on screen while the confirm animates out. */
  const [shown, setShown] = React.useState<Voice | null>(voice)
  if (voice && voice !== shown) setShown(voice)
  const inUse = (shown?.usedBy.length ?? 0) > 0

  return (
    <AlertDialog onOpenChange={onOpenChange} open={voice !== null}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {inUse ? `${shown?.name} is in use` : `Delete ${shown?.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            {inUse ? (
              <div className="flex flex-col gap-2">
                <span>
                  Switch{" "}
                  {shown?.usedBy.length === 1 ? "this persona" : "these personas"}{" "}
                  to another voice first:
                </span>
                <ul className="flex flex-col gap-1 text-foreground">
                  {shown?.usedBy.map((persona) => (
                    <li key={persona}>{persona}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>
                It’s removed from your voice library for good. The sample
                isn’t kept, so it can’t be cloned back.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{inUse ? "Close" : "Cancel"}</AlertDialogCancel>
          {inUse ? null : (
            <AlertDialogAction
              onClick={() => shown && onConfirm(shown)}
              variant="destructive"
            >
              Delete voice
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
