"use client"

import * as React from "react"

import { toast } from "sonner"

import {
  BackToPickerIcon,
  FetchWarningIcon,
  FieldHelpIcon,
  NewProviderIcon,
  RetryIcon,
  TestFailedIcon,
  TestPassedIcon,
} from "@/components/model-catalog/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
  Field,
  FieldDescription,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  liveModelsFor,
  MODALITIES,
  PROVIDERS,
  providerById,
  type Modality,
} from "@/lib/model-catalog-data"
import { cn } from "@/lib/utils"

/**
 * Adding a model, in the two weights the PRD separates.
 *
 * Picking a model under a provider we already hold credentials for is the light
 * path: the key we already call that provider with fetches its own model list,
 * so there is nothing to configure. Connecting a provider we have never reached
 * is the heavy one: base URL, credentials, model identifier, and a connection
 * test that has to pass before the model can be saved.
 *
 * One entry point, two visibly different forms. The admin only discovers which
 * path they are on at the provider field — that is the moment they find out we
 * have never called this provider — so making them choose a flow beforehand
 * would ask a question they cannot yet answer. What the PRD's Braintrust
 * benchmark asks for is that the heavier action not be folded invisibly into
 * the lighter one, so the switch changes the dialog's title, adds a way back,
 * and splits the form into labelled sections the light path does not have.
 *
 * Modality is not a field. The catalog's tab decides it, and a select that
 * repeats the tab is one more place for the wrong value to be left at its
 * default.
 */

/** The sentinel the provider Select uses for "we have never called this one". */
const NEW_PROVIDER = "__new__"

/**
 * Placeholder examples per modality. A TTS voice-set caveat shown in the LLM
 * dialog is the kind of thing a reviewer reads as invented data, so every
 * example moves with the tab the dialog was opened from.
 *
 * Only LLM can reach this dialog today — TTS is activate-only — but the type
 * covers every modality, so the TTS example stays correct rather than being
 * deleted and re-guessed if onboarding ever opens up again.
 */
const EXAMPLES: Record<Modality, { model: string; name: string }> = {
  llm: { model: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  tts: { model: "eleven_flash_v2_5", name: "ElevenLabs Flash v2.5" },
}

type Mode = "pick" | "connect"
type FetchState = "idle" | "loading" | "ready" | "failed"
type TestState = "idle" | "running" | "passed" | "failed"

export function AddModelDialog({
  modality,
  onOpenChange,
  open,
}: {
  modality: Modality
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {/* The body is the only row that scrolls, so the header, the footer and
          the Save gate stay put however long the heavy path gets. */}
      <DialogContent className="grid-rows-[auto_1fr_auto] max-h-[85vh] sm:max-w-lg">
        <AddModelBody
          key={modality}
          modality={modality}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function AddModelBody({
  modality,
  onDone,
}: {
  modality: Modality
  onDone: () => void
}) {
  const [mode, setMode] = React.useState<Mode>("pick")
  const [providerId, setProviderId] = React.useState("")
  const [modelId, setModelId] = React.useState("")
  const [displayName, setDisplayName] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [manual, setManual] = React.useState(false)
  const [fetchState, setFetchState] = React.useState<FetchState>("idle")
  const [testState, setTestState] = React.useState<TestState>("idle")

  /* Only the heavy path asks for these. */
  const [newProviderName, setNewProviderName] = React.useState("")
  const [baseUrl, setBaseUrl] = React.useState("")
  const [apiKey, setApiKey] = React.useState("")

  const modalityLabel =
    MODALITIES.find((option) => option.id === modality)?.label ?? ""
  const provider = providerById(providerId)
  const connecting = mode === "connect"
  const eligible = PROVIDERS.filter((option) =>
    option.modalities.includes(modality),
  )

  /* The live list is offered only where the provider publishes one and the
     fetch came back. Everything else — no endpoint, a fetch that timed out, or
     the admin choosing to type it — lands on the same manual field, because the
     answer in all three cases is "type the ID and prove it with a test". */
  const usesLiveList =
    !connecting &&
    provider?.listsModels === true &&
    !manual &&
    fetchState !== "failed"

  /* A model picked from a provider's own list is already proven by the list. A
     typed ID is not, and neither is a provider we have never called, so Save
     stays closed until the test passes. That gate is the whole guarantee the
     heavy path buys. */
  const testRequired = !usesLiveList && (connecting || Boolean(provider))
  const testReady = connecting
    ? Boolean(
        newProviderName.trim() && baseUrl.trim() && apiKey && modelId.trim(),
      )
    : Boolean(modelId.trim())

  const canSave =
    Boolean(modelId.trim()) &&
    Boolean(displayName.trim()) &&
    (connecting
      ? Boolean(newProviderName.trim() && baseUrl.trim() && apiKey)
      : Boolean(provider)) &&
    (!testRequired || testState === "passed")

  function selectProvider(next: string) {
    setModelId("")
    setManual(false)
    setTestState("idle")

    if (next === NEW_PROVIDER) {
      setMode("connect")
      setProviderId("")
      setFetchState("idle")
      return
    }

    setProviderId(next)

    const chosen = providerById(next)
    if (chosen?.listsModels) {
      setFetchState("loading")
      /* Groq is stubbed to fail so the fallback is reachable in the mockup
         rather than only described. */
      window.setTimeout(() => {
        setFetchState(chosen.id === "groq" ? "failed" : "ready")
      }, 900)
    } else {
      setFetchState("idle")
    }
  }

  function backToPicker() {
    setMode("pick")
    setProviderId("")
    setModelId("")
    setNewProviderName("")
    setBaseUrl("")
    setApiKey("")
    setTestState("idle")
    setFetchState("idle")
  }

  function runTest() {
    setTestState("running")
    /* A stub short ID fails, so both answers are reachable. */
    window.setTimeout(() => {
      setTestState(modelId.trim().length > 3 ? "passed" : "failed")
    }, 1100)
  }

  function save() {
    toast.success(`${displayName.trim()} added to the ${modalityLabel} catalog`)
    onDone()
  }

  return (
    <>
      <DialogHeader>
        {connecting ? (
          <Button
            className="-ms-2 self-start"
            onClick={backToPicker}
            size="xs"
            variant="ghost"
          >
            <BackToPickerIcon className="rtl:rotate-180" />
            Connected providers
          </Button>
        ) : null}

        <DialogTitle>
          {connecting ? "Connect a provider" : `Add ${modalityLabel} model`}
        </DialogTitle>
        <DialogDescription>
          {connecting
            ? "Adds the connection and its first model together."
            : `Adds it to the ${modalityLabel} picker in Global and Org Settings.`}
        </DialogDescription>
      </DialogHeader>

      {/* The ±1 pair gives focus rings room to draw inside the scroll box. */}
      <div className="-mx-1 flex min-h-0 flex-col gap-4 overflow-y-auto px-1 pb-1">
        {connecting ? (
          <>
            <Field>
              <FieldLabel htmlFor="provider-name">Provider name</FieldLabel>
              <Input
                id="provider-name"
                onChange={(event) => setNewProviderName(event.target.value)}
                placeholder="Fireworks"
                value={newProviderName}
              />
            </Field>

            <Field>
              <HelpLabel
                help="Must accept OpenAI-spec requests."
                htmlFor="base-url"
              >
                Base URL
              </HelpLabel>
              <Input
                id="base-url"
                onChange={(event) => {
                  setBaseUrl(event.target.value)
                  setTestState("idle")
                }}
                placeholder="https://api.fireworks.ai/inference/v1"
                value={baseUrl}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="api-key">API key</FieldLabel>
              <Input
                id="api-key"
                onChange={(event) => {
                  setApiKey(event.target.value)
                  setTestState("idle")
                }}
                placeholder="sk-…"
                type="password"
                value={apiKey}
              />
              {/* The one inline sentence in this dialog. A credential you
                  cannot read back is irreversible, which is the case the
                  helper-text rule keeps inline copy for. */}
              <FieldDescription>
                Stored once and never shown again.
              </FieldDescription>
            </Field>

            {/* A labelled rule rather than a heading: the form is doing two
                things, and a section title at the dialog title's own size
                would compete with it for the same job. */}
            <FieldSeparator>Model</FieldSeparator>

            <Field>
              <HelpLabel
                help="Sent to the provider exactly as typed."
                htmlFor="model"
              >
                Model identifier
              </HelpLabel>
              <Input
                id="model"
                onChange={(event) => {
                  setModelId(event.target.value)
                  setTestState("idle")
                }}
                placeholder={EXAMPLES[modality].model}
                value={modelId}
              />
            </Field>
          </>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor="provider">Provider</FieldLabel>
              <Select onValueChange={selectProvider} value={providerId}>
                <SelectTrigger className="w-full" id="provider">
                  <SelectValue placeholder="Pick a provider" />
                </SelectTrigger>
                <SelectContent>
                  {eligible.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  {/* The heavier action, kept visibly apart from the
                      connections that already exist rather than sitting in
                      the same list as one more provider. */}
                  <SelectItem value={NEW_PROVIDER}>
                    <NewProviderIcon />
                    Connect a new provider…
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {provider ? (
              <ModelField
                fetchState={fetchState}
                modelPlaceholder={EXAMPLES[modality].model}
                liveModels={liveModelsFor(provider.id, modality)}
                manual={manual}
                modelId={modelId}
                onManualChange={(next) => {
                  setManual(next)
                  setModelId("")
                  setTestState("idle")
                }}
                onModelIdChange={(next) => {
                  setModelId(next)
                  setTestState("idle")
                }}
                onRetryFetch={() => selectProvider(provider.id)}
                providerListsModels={provider.listsModels}
                providerName={provider.name}
                usesLiveList={usesLiveList}
              />
            ) : null}
          </>
        )}

        {testRequired ? (
          <ConnectionTest onRun={runTest} ready={testReady} state={testState} />
        ) : null}

        {connecting || provider ? (
          <>
            <FieldSeparator />

            <Field>
              <HelpLabel
                help="The name this model is picked by in settings."
                htmlFor="display-name"
              >
                Display name
              </HelpLabel>
              <Input
                id="display-name"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={EXAMPLES[modality].name}
                value={displayName}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <Textarea
                id="notes"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="English only — Arabic calls must not be routed here."
                rows={2}
                value={notes}
              />
            </Field>
          </>
        ) : null}
      </div>

      <DialogFooter>
        <Button onClick={onDone} variant="ghost">
          Cancel
        </Button>
        <Button disabled={!canSave} onClick={save}>
          Add model
        </Button>
      </DialogFooter>
    </>
  )
}

/**
 * A label with an (i) for the one thing about the field its own name cannot
 * carry. One sentence, and never a restatement of the label — anything that
 * needs a paragraph is a design problem, not a copy problem.
 */
function HelpLabel({
  children,
  help,
  htmlFor,
}: {
  children: string
  help: string
  htmlFor: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <FieldLabel htmlFor={htmlFor}>{children}</FieldLabel>
      <Tooltip>
        <TooltipTrigger
          aria-label={`About ${children}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <FieldHelpIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{help}</TooltipContent>
      </Tooltip>
    </div>
  )
}

/**
 * The model field, in whichever of its shapes applies.
 *
 * The switch is automatic: a provider that publishes a list gets the list. The
 * manual escape stays reachable underneath it regardless, because a live list
 * lags a provider's own releases and an admin who already knows the new ID
 * should not have to wait for the list to catch up.
 */
function ModelField({
  fetchState,
  liveModels,
  manual,
  modelId,
  modelPlaceholder,
  onManualChange,
  onModelIdChange,
  onRetryFetch,
  providerListsModels,
  providerName,
  usesLiveList,
}: {
  fetchState: FetchState
  liveModels: string[]
  manual: boolean
  modelId: string
  modelPlaceholder: string
  onManualChange: (manual: boolean) => void
  onModelIdChange: (modelId: string) => void
  onRetryFetch: () => void
  providerListsModels: boolean
  providerName: string
  usesLiveList: boolean
}) {
  if (fetchState === "loading") {
    return (
      <Field>
        <FieldLabel>Model</FieldLabel>
        <div className="flex h-8 items-center gap-2 rounded-lg bg-muted px-3 text-sm text-muted-foreground">
          <Spinner />
          Fetching {providerName}&apos;s models…
        </div>
      </Field>
    )
  }

  return (
    <Field>
      {fetchState === "failed" ? (
        /* A fetch that timed out says nothing about whether the model is
           valid, so this is a notice with a way forward, not an error. */
        <Alert>
          <FetchWarningIcon />
          <AlertTitle>
            Couldn&apos;t reach {providerName}&apos;s model list
          </AlertTitle>
          <AlertDescription>
            Enter the model ID and test it instead.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center gap-2">
        {usesLiveList ? (
          <>
            <FieldLabel htmlFor="model">Model</FieldLabel>
            {/* Provenance in three words rather than the two-line paragraph
                this used to carry. */}
            <Badge variant="outline">Live from {providerName}</Badge>
          </>
        ) : (
          <HelpLabel
            help="Sent to the provider exactly as typed."
            htmlFor="model"
          >
            Model identifier
          </HelpLabel>
        )}
      </div>

      {usesLiveList ? (
        <Select onValueChange={onModelIdChange} value={modelId}>
          <SelectTrigger className="w-full" id="model">
            <SelectValue placeholder="Pick a model" />
          </SelectTrigger>
          <SelectContent>
            {liveModels.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id="model"
          onChange={(event) => onModelIdChange(event.target.value)}
          placeholder={modelPlaceholder}
          value={modelId}
        />
      )}

      {/* An escape, not an explainer: every one of these is an action the admin
          can take when the field in front of them is the wrong one. */}
      {/* `Field` puts `*:w-full` on its direct children, so a button that
          should hug its own text stretches and centres. The wrapper takes the
          full width and lets the button keep its intrinsic one. */}
      <div className="flex">
        {usesLiveList ? (
          <Button onClick={() => onManualChange(true)} size="xs" variant="link">
            Not seeing it? Enter the ID manually
          </Button>
        ) : fetchState === "failed" ? (
          <Button onClick={onRetryFetch} size="xs" variant="outline">
            <RetryIcon />
            Try the list again
          </Button>
        ) : manual && providerListsModels ? (
          <Button
            onClick={() => onManualChange(false)}
            size="xs"
            variant="link"
          >
            Back to {providerName}&apos;s list
          </Button>
        ) : null}
      </div>
    </Field>
  )
}

/**
 * The connection test.
 *
 * It gates Save on the paths where nothing else proves the model exists — a
 * provider we have never called, or an ID typed by hand. On the live-list path
 * it is absent entirely, because picking from the provider's own list already
 * is the proof.
 */
function ConnectionTest({
  onRun,
  ready,
  state,
}: {
  onRun: () => void
  ready: boolean
  state: TestState
}) {
  const passed = state === "passed"
  const failed = state === "failed"

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-muted p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Connection test</span>
          {/* One word in place of the sentence that used to say Save is
              blocked — the disabled Save button already says that. */}
          <Badge variant="outline">Required</Badge>
        </div>
        <Button
          disabled={!ready || state === "running"}
          onClick={onRun}
          size="sm"
          variant="outline"
        >
          {state === "running" ? <Spinner /> : null}
          {state === "running" ? "Testing…" : passed ? "Test again" : "Test"}
        </Button>
      </div>

      {passed || failed ? (
        <div className="flex items-start gap-2 rounded-lg bg-card p-3 text-sm">
          {passed ? (
            <TestPassedIcon className="mt-0.5 size-4 shrink-0 text-success" />
          ) : (
            <TestFailedIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
          )}
          <span className={cn(!passed && "text-foreground")}>
            {passed
              ? "The provider answered in 412 ms."
              : "The provider rejected that model ID — check it against their own documentation."}
          </span>
        </div>
      ) : null}
    </div>
  )
}
