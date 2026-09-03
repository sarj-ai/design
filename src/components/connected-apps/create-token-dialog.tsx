"use client"

import * as React from "react"

import { toast } from "sonner"

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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  formatDate,
  mintSecret,
  NOW,
  prefixOf,
  READ_ONLY_SCOPES,
  scopeSummary,
  type ConnectedApp,
  type Permission,
  type Token,
} from "@/lib/connected-apps-data"
import { ScopePicker } from "@/components/connected-apps/scope-picker"
import {
  CopiedIcon,
  CopyTokenIcon,
  NearExpiryIcon,
} from "@/components/connected-apps/icons"

const EXPIRY_CHOICES = [
  { days: 30, id: "30", label: "In 30 days" },
  { days: 60, id: "60", label: "In 60 days" },
  { days: 90, id: "90", label: "In 90 days" },
  { days: 365, id: "365", label: "In a year" },
]

const NEVER = "never"

function expiryFrom(choice: string): string | null {
  const option = EXPIRY_CHOICES.find((entry) => entry.id === choice)
  if (!option) return null
  return new Date(
    new Date(NOW).getTime() + option.days * 86_400_000,
  ).toISOString()
}

/**
 * Minting a token, and the one moment its secret exists on screen.
 *
 * The platform hands the raw value back exactly once and stores only a hash of
 * it, so this dialog is the whole of the reader's opportunity. That is why it
 * stops being dismissible once the secret is showing: the scrim, Escape and the
 * close button all route through the same check, and there is one way out.
 *
 * Deliberately one dialog rather than a create dialog followed by a reveal
 * dialog. The secret belongs to the thing just created, and a second overlay
 * would let the first one close underneath it — taking the only copy of the
 * value with it.
 */
export function CreateTokenDialog({
  app,
  onCreated,
  onOpenChange,
  open,
}: {
  app: ConnectedApp
  onCreated: (token: Token) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  /* Lifted out of the body because the parts that dismiss a dialog — the
     scrim, Escape, the close button — belong to the shell, and they all have
     to route through the same check once the secret is on screen. */
  const [locked, setLocked] = React.useState(false)
  const guard = React.useRef<() => void>(() => onOpenChange(false))

  /* Stable identities: the body registers its guard from an effect, so a
     handler rebuilt on every render would re-register on every render. */
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange])
  const registerGuard = React.useCallback(
    (locking: boolean, requestClose: () => void) => {
      setLocked(locking)
      guard.current = requestClose
    },
    [],
  )

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next && locked) {
          guard.current()
          return
        }
        onOpenChange(next)
      }}
      open={open}
    >
      <DialogContent
        className="sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (!locked) return
          /* Escape still asks, rather than being dead — it just gets the
             same answer the Done button gets. */
          event.preventDefault()
          guard.current()
        }}
        onInteractOutside={(event) => {
          if (locked) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (locked) event.preventDefault()
        }}
        showCloseButton={!locked}
      >
        {/* Keyed on the app so every open starts clean — the phase, the form
            and above all the secret are gone when this unmounts. */}
        <CreateTokenBody
          app={app}
          key={app.id}
          onClose={close}
          onCreated={onCreated}
          onGuardChange={registerGuard}
        />
      </DialogContent>
    </Dialog>
  )
}

type Phase = "form" | "creating" | "revealed" | "confirm-close"

function CreateTokenBody({
  app,
  onClose,
  onCreated,
  onGuardChange,
}: {
  app: ConnectedApp
  onClose: () => void
  onCreated: (token: Token) => void
  onGuardChange: (locked: boolean, requestClose: () => void) => void
}) {
  const [phase, setPhase] = React.useState<Phase>("form")
  const [name, setName] = React.useState("")
  const [scopes, setScopes] = React.useState<Permission[]>(READ_ONLY_SCOPES)
  const [expiry, setExpiry] = React.useState("90")
  const [secret, setSecret] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  React.useEffect(() => () => clearTimeout(timer.current), [])

  /* Sealed from the moment the secret appears until the reader has answered
     for it. The confirm step stays sealed too, so its own close button cannot
     become a third exit that skips the question. "Close anyway" is safe
     because it calls onClose directly rather than going through the shell. */
  const locked = phase === "revealed" || phase === "confirm-close"
  React.useEffect(() => {
    onGuardChange(locked, () => {
      if (copied) onClose()
      else setPhase("confirm-close")
    })
  }, [copied, locked, onClose, onGuardChange])

  const expiresAt = expiryFrom(expiry)
  const canSave = name.trim().length > 0 && scopes.length > 0

  function create() {
    setPhase("creating")

    /* Stands in for the round trip. The secret is minted here rather than
       living on the record, because on the real thing it exists only in this
       response. */
    window.setTimeout(() => {
      const value = mintSecret()
      setSecret(value)
      setPhase("revealed")
      onCreated({
        appId: app.id,
        createdAt: NOW,
        createdBy: "Nawaf Al-Harbi",
        expiresAt,
        id: `tok-${prefixOf(value)}`,
        lastUsedAt: null,
        name: name.trim(),
        prefix: prefixOf(value),
        revokedAt: null,
        scopes,
      })
    }, 700)
  }

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
      toast.success("Access token copied", { description: name.trim() })
    } catch {
      /* The clipboard is permission-gated and unavailable on an insecure
         origin. This is the one screen where failing quietly would lose
         something unrecoverable, so the value goes into the toast. */
      toast.error("Could not reach the clipboard", { description: secret })
    }
  }

  /** The only exit once the secret is showing. */
  function attemptClose() {
    if (copied) {
      onClose()
      return
    }
    setPhase("confirm-close")
  }

  if (phase === "confirm-close") {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Close without copying the token?</DialogTitle>
          <DialogDescription>
            This is the only time the secret is shown. Close now and it cannot
            be recovered — the token stays live, so the only way back is to
            revoke it and create another.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={() => setPhase("revealed")} variant="outline">
            Back to the token
          </Button>
          {/* Not "Discard token" — the token exists and works. Only the
              secret is lost, and the label should not claim otherwise. */}
          <Button onClick={onClose} variant="destructive">
            Close anyway
          </Button>
        </DialogFooter>
      </>
    )
  }

  if (phase === "revealed") {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Your new access token has been created</DialogTitle>
          <DialogDescription>
            Make sure to copy this token now. You will not be able to see it
            again.
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-warning-tint text-warning-tint-foreground">
          <NearExpiryIcon />
          <AlertDescription className="text-warning-tint-foreground">
            Sarj stores only a hash of this value. Nobody can show it to you a
            second time — not you, not support.
          </AlertDescription>
        </Alert>

        {/* An Input rather than a code block: it is keyboard reachable, it
            selects on focus, and readOnly keeps all of that alive where
            disabled would kill it. `dir="ltr"` so a base64 credential is not
            reordered next to Arabic content. */}
        <InputGroup>
          <InputGroupInput
            aria-label="Access token"
            className="font-mono"
            dir="ltr"
            onCopy={() => setCopied(true)}
            onFocus={(event) => event.currentTarget.select()}
            readOnly
            value={secret}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={copySecret}>
              {copied ? <CopiedIcon /> : <CopyTokenIcon />}
              {copied ? "Copied" : "Copy"}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <p className="text-sm text-muted-foreground">
          <span dir="auto">{name.trim()}</span> · {scopeSummary(scopes)} ·{" "}
          {expiresAt ? `Expires ${formatDate(expiresAt)}` : "Never expires"}
        </p>

        <DialogFooter>
          {/* Never gated on having copied — a reader whose clipboard is
              blocked would be trapped in a dialog they cannot leave. */}
          <Button onClick={attemptClose}>Done</Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>New access token</DialogTitle>
        <DialogDescription>
          This creates a live token for <span dir="auto">{app.name}</span>{" "}
          immediately. The full secret is shown only once, so be ready to copy
          it.
        </DialogDescription>
      </DialogHeader>

      <div className="-mx-1 flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-1">
        <Field>
          <FieldLabel htmlFor="token-name">Name</FieldLabel>
          <Input
            dir="auto"
            id="token-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Production sync"
            value={name}
          />
          <FieldDescription>
            Name it for where it runs, so you know which one to revoke.
          </FieldDescription>
        </Field>

        <ScopePicker onChange={setScopes} scopes={scopes} />

        <Field>
          <FieldLabel htmlFor="token-expiry">Expires</FieldLabel>
          <Select onValueChange={setExpiry} value={expiry}>
            <SelectTrigger id="token-expiry">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPIRY_CHOICES.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectSeparator />
              {/* Set apart because it is the heavier choice, not the tidy
                  one — a token nobody has to renew is also a token nobody
                  remembers to remove. */}
              <SelectItem value={NEVER}>No expiry</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            {expiresAt
              ? `Stops working on ${formatDate(expiresAt)}.`
              : "It keeps working until someone revokes it."}
          </FieldDescription>
        </Field>
      </div>

      <DialogFooter>
        <Button onClick={onClose} variant="ghost">
          Cancel
        </Button>
        <Button disabled={!canSave || phase === "creating"} onClick={create}>
          {phase === "creating" ? <Spinner /> : null}
          {phase === "creating" ? "Creating…" : "Create token"}
        </Button>
      </DialogFooter>
    </>
  )
}
