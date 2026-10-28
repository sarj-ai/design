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
import { SaveBar } from "@/components/shared/save-bar"
import { EditorHeader } from "@/components/mockups/config-versioning/editor-header"
import {
  type ApplyResult,
  HistoryDrawer,
} from "@/components/mockups/config-versioning/history-drawer"
import { BackToNewestIcon } from "@/components/mockups/config-versioning/icons"
import { SaveReview } from "@/components/mockups/config-versioning/save-review"
import {
  type CaseId,
  REMOVED_BLOCK,
  RIVAL,
  type Subject,
  type Version,
} from "@/lib/mockups/config-versioning-data"

export function VersionedEditor({
  initial,
  caseId,
  openAt,
}: {
  initial: Subject
  caseId: CaseId
  /** Opens History on this version. */
  openAt?: number
}) {
  const [subject, setSubject] = React.useState(initial)
  const [base, setBase] = React.useState(initial.versions[0].n)
  const [draft, setDraft] = React.useState(initial.versions[0].body)
  const [reviewing, setReviewing] = React.useState(false)
  const [reviewKey, setReviewKey] = React.useState(0)
  const [saveFailed, setSaveFailed] = React.useState(false)
  const [history, setHistory] = React.useState<{
    n: number
    against: number | null
  } | null>(openAt ? { n: openAt, against: null } : null)
  const [rival, setRival] = React.useState<Version | null>(null)

  const canEdit = caseId !== "view-only"
  const canToggle = canEdit && caseId !== "no-live-permission"
  const newest = subject.versions[0]
  const baseVersion =
    subject.versions.find((version) => version.n === base) ?? newest
  const editingFrom = base !== newest.n && !rival
  const changes = subject.fields.filter(
    (field) => draft[field.id] !== newest.body[field.id],
  ).length
  const ahead = subject.versions.filter((version) => version.n > subject.inUse)

  function openReview() {
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
    setSaveFailed(false)
    setReviewKey((current) => current + 1)
    setReviewing(true)
  }

  function save(note: string) {
    if (caseId === "save-fails" && !saveFailed) {
      setSaveFailed(true)
      return
    }
    const n = subject.versions[0].n + 1
    const made: Version = {
      n,
      author: "You",
      mine: true,
      at: "Just now",
      editedFrom: base,
      note: note || null,
      body: draft,
    }
    setSubject((current) => ({
      ...current,
      versions: [made, ...current.versions],
      ...(current.live
        ? {}
        : {
            inUse: n,
            log: [
              { n, by: "You", at: "just now", how: "saved" as const },
              ...current.log,
            ],
          }),
    }))
    setBase(n)
    setRival(null)
    setSaveFailed(false)
    setReviewing(false)
    toast.success("Saved", {
      description: subject.live
        ? "Callers keep getting the version in use until you publish."
        : "It’s in use from the next call.",
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

  async function apply(n: number): Promise<ApplyResult> {
    await new Promise((resolve) => setTimeout(resolve, 900))
    if (caseId === "publish-fails") return "failed"
    if (caseId === "apply-blocked") return "blocked"
    const version = subject.versions.find((item) => item.n === n)
    if (!version) return "failed"
    const before = { inUse: subject.inUse, log: subject.log }
    const how = subject.live && n > before.inUse ? "published" : "applied"
    setSubject((current) => ({
      ...current,
      inUse: n,
      log: [{ n, by: "You", at: "just now", how }, ...current.log],
    }))
    setBase(n)
    setDraft(version.body)
    setHistory(null)
    toast.success(`v${n} is in use`, {
      description:
        caseId === "apply-skips"
          ? `${REMOVED_BLOCK} was skipped. It’s no longer in the product.`
          : "Callers get it from the next call. No version was made.",
      action: subject.live
        ? undefined
        : {
            label: "Undo",
            onClick: () =>
              setSubject((current) => ({
                ...current,
                inUse: before.inUse,
                log: before.log,
              })),
          },
    })
    return "ok"
  }

  function editFrom(n: number) {
    const version = subject.versions.find((item) => item.n === n)
    if (!version) return
    setBase(n)
    setDraft(version.body)
    setHistory(null)
  }

  function toggleLive(on: boolean) {
    const before = { live: subject.live, toggled: subject.toggled }
    setSubject((current) => ({
      ...current,
      live: on,
      toggled: { by: "You", at: "just now" },
    }))
    toast(
      on ? `${subject.name} is live` : `${subject.name} is no longer live`,
      {
        description: on
          ? "The version in use doesn’t change. Saves now wait for a publish."
          : "The version in use doesn’t change. Saves now apply straight away.",
        action: {
          label: "Undo",
          onClick: () =>
            setSubject((current) => ({
              ...current,
              live: before.live,
              toggled: before.toggled,
            })),
        },
      },
    )
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 p-8 pb-4">
      <EditorHeader
        canEdit={canEdit}
        canToggle={canToggle}
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
                ? "1 save since the version in use. Callers don’t get it yet."
                : `${ahead.length} saves since the version in use. Callers don’t get them yet.`}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              disabled={!canEdit || !subject.live}
              onClick={() =>
                setHistory({ n: newest.n, against: subject.inUse })
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

      <SaveBar changes={changes} onDiscard={discard} onSave={openReview} />

      <SaveReview
        base={base}
        draft={draft}
        failed={saveFailed}
        key={reviewKey}
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
        onApply={apply}
        onEditFrom={editFrom}
        onOpenChange={(open) => {
          if (!open) setHistory(null)
        }}
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
