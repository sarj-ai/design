"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Textarea } from "@/components/ui/textarea"
import { EditorHeader } from "@/components/mockups/config-versioning/editor-header"
import { HistoryDrawer } from "@/components/mockups/config-versioning/history-drawer"
import { BackToNewestIcon } from "@/components/mockups/config-versioning/icons"
import { SaveReview } from "@/components/mockups/config-versioning/save-review"
import {
  type CaseId,
  RIVAL,
  type Subject,
  type Version,
} from "@/lib/mockups/config-versioning-data"

/**
 * The editor for anything versioned — a scenario's Scenario tab, or the
 * global prompt — cut to what DES-202 changes.
 *
 * The editor names two versions and never numbers them: the live version
 * (what callers hear) and the latest (the newest save). Numbers live in
 * History, where you pick one. Review on 13 Oct 2026 found a screen with
 * v9, v12, v13 and v14 on it at once unreadable; Langfuse's production and
 * latest labels are the model.
 *
 *  - Save makes a version. Live or not, the save review says what the save
 *    does to callers (save-review.tsx).
 *  - On a live item with saves ahead of the marker, one row under the header
 *    says which versions are not live and offers Review and publish. It is
 *    the ticket's draft indicator, unpublished state and publish action in
 *    one place, and it is absent when there is nothing to publish.
 *  - History (history-drawer.tsx) is where publishing, rolling back and
 *    "edit from here" happen, with the comparison on screen.
 *  - Edit from here opens an earlier version as the starting point, says so
 *    above the fields, and saves as a new version on top (PRD).
 */
export function VersionedEditor({
  initial,
  caseId,
}: {
  initial: Subject
  caseId: CaseId
}) {
  const [subject, setSubject] = React.useState(initial)
  const [base, setBase] = React.useState(initial.versions[0].n)
  const [draft, setDraft] = React.useState(initial.versions[0].body)
  const [reviewing, setReviewing] = React.useState(false)
  const [history, setHistory] = React.useState<{
    n: number
    against: number | null
  } | null>(null)
  const [rival, setRival] = React.useState<Version | null>(null)

  const canEdit = caseId !== "view-only"
  const newest = subject.versions[0]
  const baseVersion =
    subject.versions.find((version) => version.n === base) ?? newest
  const editingFrom = base !== newest.n && !rival
  const changes = subject.fields.filter(
    (field) => draft[field.id] !== newest.body[field.id],
  ).length
  const live = subject.marker !== null
  const ahead = live
    ? subject.versions.filter((v) => v.n > subject.marker!)
    : []

  /* A summary for a fresh save arrives a moment later (PRD: generation never
     blocks the save). In the pending case it never does. */
  React.useEffect(() => {
    if (caseId === "summary-pending") return
    if (newest.summary !== null) return
    const timer = setTimeout(
      () =>
        setSubject((current) => ({
          ...current,
          versions: current.versions.map((version) =>
            version.summary === null
              ? { ...version, summary: summarise(current, version) }
              : version,
          ),
        })),
      2500,
    )
    return () => clearTimeout(timer)
  }, [caseId, newest.summary])

  function openReview() {
    /* The conflict case: someone else's save lands after this page opened. */
    if (caseId === "conflict" && !rival) {
      const theirs: Version = {
        ...RIVAL,
        n: newest.n + 1,
        editedFrom: newest.n,
        body: {
          ...newest.body,
          [subject.fields[0].id]:
            `${newest.body[subject.fields[0].id]} I'm calling from the Olaya branch.`,
        },
      }
      setRival(theirs)
      setSubject((current) => ({
        ...current,
        versions: [theirs, ...current.versions],
      }))
    }
    setReviewing(true)
  }

  function save() {
    const n = subject.versions[0].n + 1
    const made: Version = {
      n,
      author: "You",
      mine: true,
      at: "Just now",
      editedFrom: base,
      summary: null,
      everLive: false,
      body: draft,
    }
    setSubject((current) => ({
      ...current,
      versions: [made, ...current.versions],
    }))
    setBase(n)
    setRival(null)
    setReviewing(false)
    toast.success("Saved", {
      description: live
        ? "Callers keep hearing the live version until you publish."
        : "It runs from the next call.",
    })
  }

  function discard() {
    const before = { draft, base }
    setDraft(newest.body)
    setBase(newest.n)
    toast("Changes discarded", {
      action: {
        label: "Undo",
        onClick: () => {
          setDraft(before.draft)
          setBase(before.base)
        },
      },
    })
  }

  async function publish(n: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 900))
    if (caseId === "publish-fails") return false
    const before = { marker: subject.marker, published: subject.published }
    setSubject((current) => ({
      ...current,
      marker: n,
      published: { by: "You", at: "Just now" },
      versions: current.versions.map((version) =>
        version.n === n ? { ...version, everLive: true } : version,
      ),
    }))
    setHistory(null)
    toast.success(`v${n} is live`, {
      description:
        before.marker !== null && n < before.marker
          ? `Rolled back from v${before.marker}. No version was made.`
          : "Callers hear it from the next call.",
      action: {
        label: "Undo",
        onClick: () =>
          setSubject((current) => ({
            ...current,
            marker: before.marker,
            published: before.published,
          })),
      },
    })
    return true
  }

  function editFrom(n: number) {
    const version = subject.versions.find((item) => item.n === n)
    if (!version) return
    setBase(n)
    setDraft(version.body)
    setHistory(null)
  }

  function toggleLive(on: boolean) {
    const before = {
      marker: subject.marker,
      published: subject.published,
      toggled: subject.toggled,
    }
    setSubject((current) => ({
      ...current,
      marker: on ? current.versions[0].n : null,
      published: on ? { by: "You", at: "Just now" } : null,
      toggled: { by: "You", at: "just now" },
      versions: on
        ? current.versions.map((version, index) =>
            index === 0 ? { ...version, everLive: true } : version,
          )
        : current.versions,
    }))
    toast(
      on ? `${subject.name} is live` : `${subject.name} is no longer live`,
      {
        description: on
          ? "The latest version is now live. Saves wait for a publish."
          : "The latest version runs from the next call. Saves apply straight away.",
        action: {
          label: "Undo",
          onClick: () =>
            setSubject((current) => ({
              ...current,
              marker: before.marker,
              published: before.published,
              toggled: before.toggled,
            })),
        },
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8 pb-28">
      <EditorHeader
        canEdit={canEdit}
        onOpenHistory={() => setHistory({ n: newest.n, against: null })}
        onToggleLive={toggleLive}
        subject={subject}
      />

      {ahead.length > 0 ? (
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Unpublished changes</ItemTitle>
            <ItemDescription className="tabular-nums">
              {ahead.length === 1
                ? "1 save since the live version. Callers don’t hear it yet."
                : `${ahead.length} saves since the live version. Callers don’t hear them yet.`}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              disabled={!canEdit}
              onClick={() =>
                setHistory({ n: newest.n, against: subject.marker })
              }
            >
              Review and publish
            </Button>
          </ItemActions>
        </Item>
      ) : null}

      {editingFrom ? (
        <Alert>
          <AlertTitle>Editing an older version</AlertTitle>
          <AlertDescription>
            {baseVersion.author}, {baseVersion.at}. Saving makes it the latest;
            nothing is lost.
          </AlertDescription>
          <AlertAction>
            <Button onClick={discard} size="sm" variant="outline">
              <BackToNewestIcon />
              Back to latest
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <FieldGroup>
        {subject.fields.map((field) => (
          <Field key={field.id}>
            <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
            {field.multiline ? (
              <Textarea
                dir="auto"
                disabled={!canEdit}
                id={field.id}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field.id]: event.target.value,
                  }))
                }
                rows={6}
                value={draft[field.id]}
              />
            ) : (
              <Input
                dir="auto"
                disabled={!canEdit}
                id={field.id}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field.id]: event.target.value,
                  }))
                }
                value={draft[field.id]}
              />
            )}
          </Field>
        ))}
      </FieldGroup>

      {changes > 0 ? (
        <Card className="sticky bottom-4" size="sm">
          <CardContent className="flex items-center gap-3">
            <span className="text-sm tabular-nums">
              {changes === 1 ? "1 change" : `${changes} changes`}
            </span>
            <div className="ms-auto flex items-center gap-2">
              <Button onClick={discard} variant="ghost">
                Discard
              </Button>
              <Button onClick={openReview}>Review and save</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <SaveReview
        base={base}
        draft={draft}
        onOpenChange={setReviewing}
        onSave={save}
        open={reviewing}
        rival={rival}
        subject={subject}
      />

      <HistoryDrawer
        canEdit={canEdit}
        caseId={caseId}
        editing={base}
        initial={history ?? { n: newest.n, against: null }}
        onEditFrom={editFrom}
        onOpenChange={(open) => {
          if (!open) setHistory(null)
        }}
        onPublish={publish}
        open={history !== null}
        subject={
          caseId === "view-only"
            ? {
                ...subject,
                versions: subject.versions.map((v) => ({ ...v, mine: false })),
              }
            : subject
        }
      />
    </div>
  )
}

/** A stand-in for the generated summary: which parts the save touched. */
function summarise(subject: Subject, version: Version) {
  const parent = subject.versions.find((item) => item.n === version.editedFrom)
  const touched = subject.fields
    .filter(
      (field) => parent && parent.body[field.id] !== version.body[field.id],
    )
    .map((field) => field.label)
  return touched.length
    ? `${touched.join(" and ")}: edited${version.editedFrom ? ` from v${version.editedFrom}` : ""}.`
    : `Same content as v${version.editedFrom}.`
}
