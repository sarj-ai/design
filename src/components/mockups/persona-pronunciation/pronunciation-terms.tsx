"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  PRONUNCIATION_TERMS,
  type PronunciationTerm,
} from "@/lib/mockups/persona-pronunciation-data"
import {
  BulkUploadIcon,
  DeleteTermIcon,
  HearIcon,
  SearchIcon,
  StopHearingIcon,
} from "@/components/mockups/persona-pronunciation/icons"

type TermField = "word" | "replacement"

/** How long a fake preview "plays" before the button returns to Play. */
const PREVIEW_MS = 1500

/**
 * The pronunciation table — the reason the persona dialog was widened.
 *
 * The add row is always visible at the top of the box so a term never has
 * to be reached through a menu, and "Hear it" plays the replacement as typed,
 * so the tashkeel is checked before the term is saved instead of on the next
 * call. Duplicate words are refused at add, never merged.
 *
 * Each saved cell is editable in place: click, retype, blur or Enter to keep,
 * Escape to drop.
 */
export function PronunciationTerms() {
  const [terms, setTerms] = React.useState(PRONUNCIATION_TERMS)
  const [query, setQuery] = React.useState("")
  const [word, setWord] = React.useState("")
  const [replacement, setReplacement] = React.useState("")
  /** "draft" for the add row, otherwise the term id. */
  const [playing, setPlaying] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<{
    id: string
    field: TermField
  } | null>(null)

  const trimmedWord = word.trim()
  const trimmedReplacement = replacement.trim()
  const duplicate =
    trimmedWord.length > 0 && terms.some((term) => term.word === trimmedWord)
  const canAdd =
    trimmedWord.length > 0 && trimmedReplacement.length > 0 && !duplicate

  const needle = query.trim()
  const shown = needle
    ? terms.filter(
        (term) =>
          term.word.includes(needle) || term.replacement.includes(needle),
      )
    : terms

  function play(id: string) {
    if (playing === id) {
      setPlaying(null)
      return
    }
    setPlaying(id)
    window.setTimeout(
      () => setPlaying((current) => (current === id ? null : current)),
      PREVIEW_MS,
    )
  }

  function add() {
    if (!canAdd) return
    setTerms([
      {
        id: `t${Date.now()}`,
        word: trimmedWord,
        replacement: trimmedReplacement,
      },
      ...terms,
    ])
    setWord("")
    setReplacement("")
  }

  function clear() {
    setWord("")
    setReplacement("")
  }

  function remove(id: string) {
    setTerms(terms.filter((term) => term.id !== id))
  }

  function commit(id: string, field: TermField, value: string) {
    const next = value.trim()
    setEditing(null)
    if (!next) return
    setTerms(
      terms.map((term) => (term.id === id ? { ...term, [field]: next } : term)),
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold">Pronunciation terms</h3>
        <Badge variant="secondary">{terms.length}</Badge>
      </div>

      <div className="flex items-center gap-3">
        <InputGroup className="flex-1">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search terms"
            placeholder="Search terms…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
        <Button variant="outline">
          <BulkUploadIcon />
          Bulk upload
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex flex-col gap-2 border-b p-3">
          <div className="flex items-center gap-2">
            <Input
              aria-invalid={duplicate || undefined}
              aria-label="Word"
              className="flex-1"
              dir="auto"
              placeholder="Word (e.g. اكتئاب)"
              value={word}
              onChange={(event) => setWord(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") add()
              }}
            />
            <Input
              aria-label="Replacement"
              className="flex-1"
              dir="auto"
              placeholder="Replacement (e.g. اِكْتِئاب)"
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") add()
              }}
            />
            <Button
              variant="outline"
              disabled={trimmedReplacement.length === 0}
              onClick={() => play("draft")}
            >
              {playing === "draft" ? <StopHearingIcon /> : <HearIcon />}
              Hear it
            </Button>
            <Button disabled={!canAdd} onClick={add}>
              Add
            </Button>
            <Button variant="outline" onClick={clear}>
              Clear
            </Button>
          </div>
          {duplicate ? (
            <p className="text-sm text-destructive">
              <span dir="auto">{trimmedWord}</span> is already in the list. Edit
              that row instead.
            </p>
          ) : null}
        </div>

        <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-80">
          <Table>
            <TableBody>
              {shown.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    className="p-4 text-center text-muted-foreground"
                    colSpan={3}
                  >
                    {needle ? (
                      <>
                        No terms match <span dir="auto">{needle}</span>.
                      </>
                    ) : (
                      "No pronunciation terms yet. Add one above, or bulk upload a file."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                shown.map((term) => (
                  <TableRow key={term.id}>
                    <TableCell className="px-3">
                      <EditableTerm
                        editing={
                          editing?.id === term.id && editing.field === "word"
                        }
                        field="word"
                        term={term}
                        onCommit={(value) => commit(term.id, "word", value)}
                        onEdit={() =>
                          setEditing({ id: term.id, field: "word" })
                        }
                        onCancel={() => setEditing(null)}
                      />
                    </TableCell>
                    <TableCell className="px-3">
                      <EditableTerm
                        editing={
                          editing?.id === term.id &&
                          editing.field === "replacement"
                        }
                        field="replacement"
                        term={term}
                        onCommit={(value) =>
                          commit(term.id, "replacement", value)
                        }
                        onEdit={() =>
                          setEditing({ id: term.id, field: "replacement" })
                        }
                        onCancel={() => setEditing(null)}
                      />
                    </TableCell>
                    <TableCell className="w-0 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => play(term.id)}
                        >
                          {playing === term.id ? (
                            <StopHearingIcon />
                          ) : (
                            <HearIcon />
                          )}
                          Play
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(term.id)}
                        >
                          <DeleteTermIcon />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </section>
  )
}

/**
 * One cell of a saved term. At rest it is the word with a dotted underline —
 * the one cue that it can be clicked into. While editing it is a plain input
 * that keeps on blur or Enter and drops on Escape.
 */
function EditableTerm({
  term,
  field,
  editing,
  onEdit,
  onCommit,
  onCancel,
}: {
  term: PronunciationTerm
  field: TermField
  editing: boolean
  onEdit: () => void
  onCommit: (value: string) => void
  onCancel: () => void
}) {
  const value = term[field]

  if (editing) {
    return (
      <Input
        autoFocus
        aria-label={`Edit ${field}`}
        defaultValue={value}
        dir="auto"
        onBlur={(event) => onCommit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
          if (event.key === "Escape") onCancel()
        }}
      />
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ms-2.5 font-normal"
      aria-label={`Edit ${field} ${value}`}
      onClick={onEdit}
    >
      <span
        className="underline decoration-dotted underline-offset-4"
        dir="auto"
      >
        {value}
      </span>
    </Button>
  )
}
