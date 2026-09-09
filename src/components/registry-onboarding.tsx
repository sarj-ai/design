"use client"

import * as React from "react"
import { useSyncExternalStore } from "react"
import { toast } from "sonner"

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
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import {
  CopiedIcon,
  CopyIcon,
  HelpIcon,
  RegistryIcon,
  TerminalIcon,
} from "@/components/workspace-icons"
import { MOCKUPS } from "@/lib/mockups-data"
import { INSTALL_COMMANDS, registryUrl } from "@/lib/registry"
import { cn } from "@/lib/utils"

/**
 * What the registry is, in two steps, the first time somebody opens the lab.
 *
 * The `</>` on a card is the one control here nobody guesses: it looks like a
 * decoration until it is pressed, and what it copies only makes sense if you
 * already know these screens are published as shadcn registry items. A tooltip
 * can say "add to another repo"; it cannot say what lands in your components
 * folder or where the command is meant to be run.
 *
 * It opens itself once and then never again — the flag lives in localStorage,
 * and the header keeps a button so it is reachable rather than gone.
 */
const SEEN_KEY = "design-lab:registry-onboarding-seen"

/* A real slug rather than `<slug>`: the command in the last step is meant to
   be copied and run, and a placeholder cannot be. */
const EXAMPLE = MOCKUPS[0]
const EXAMPLE_COMMAND = INSTALL_COMMANDS[0].command(
  registryUrl(EXAMPLE.href.slice(1)),
)

/**
 * Whether this browser has been shown the walkthrough, as an external store.
 *
 * `localStorage` is exactly what `useSyncExternalStore` is for: it is state
 * React does not own, it does not exist on the server, and reading it in an
 * effect to then `setState` is the cascading render the lint rule rejects.
 * The server snapshot is `true` — the dialog is shut in the HTML, and only a
 * browser that has never seen it opens it after hydration.
 */
let listeners: (() => void)[] = []

function subscribeSeen(callback: () => void) {
  listeners = [...listeners, callback]
  return () => {
    listeners = listeners.filter((listener) => listener !== callback)
  }
}

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) !== null
  } catch {
    /* A private window, or site data blocked. The dismissal could not be
       remembered either, so it counts as seen rather than greeting the same
       person on every visit. The header button still opens it. */
    return true
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1")
  } catch {
    /* Nothing to do — `readSeen` already treats an unreachable store as seen. */
  }

  for (const listener of listeners) listener()
}

export function RegistryOnboarding() {
  const seen = useSyncExternalStore(subscribeSeen, readSeen, () => true)

  /* Null until the reader opens or closes it themselves; until then the store
     decides, which is what makes the first visit open it and every later one
     not. */
  const [manual, setManual] = React.useState<boolean | null>(null)
  const open = manual ?? !seen

  const [step, setStep] = React.useState(0)
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  React.useEffect(() => () => clearTimeout(timer.current), [])

  function close() {
    setManual(false)
    markSeen()
  }

  function reopen() {
    setStep(0)
    setManual(true)
  }

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(EXAMPLE_COMMAND)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
      toast.success("Command copied", { description: EXAMPLE.title })
    } catch {
      /* Same failure the card menu handles: the clipboard is permission-gated
         and unavailable on an insecure origin, so the text still has to reach
         the reader somehow. */
      toast.error("Could not reach the clipboard", {
        description: EXAMPLE_COMMAND,
      })
    }
  }

  const steps = [
    {
      id: "copy",
      title: "Open its install command",
      body: "Every card carries one beside Open mockup. It holds the same install in npm, pnpm, bun and yarn, and the raw registry URL under them.",
      figure: (
        <Item aria-hidden className="pointer-events-none" variant="outline">
          <ItemContent>
            <ItemTitle>{EXAMPLE.title}</ItemTitle>
            <ItemDescription>{EXAMPLE.meta}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="icon-sm" tabIndex={-1} variant="ghost">
              <RegistryIcon />
            </Button>
          </ItemActions>
        </Item>
      ),
    },
    {
      id: "paste",
      title: "Paste it in that repo's terminal",
      body: "It installs the route, its mock data and every shadcn primitive the screen uses — into your own components folder, so your Button is not overwritten with this one.",
      /* The live command, not a picture of one: the whole step is the copy,
         and a reader who copies it here has already done the thing. */
      figure: (
        <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
          <TerminalIcon className="mt-0.5 shrink-0 text-muted-foreground" />
          <code className="min-w-0 flex-1 font-mono text-xs break-all">
            {EXAMPLE_COMMAND}
          </code>
          <Button
            aria-label="Copy the install command"
            onClick={copyCommand}
            size="icon-sm"
            variant="ghost"
          >
            {copied ? <CopiedIcon /> : <CopyIcon />}
          </Button>
        </div>
      ),
    },
  ]

  const current = steps[step]
  const last = step === steps.length - 1

  return (
    <>
      {/* Ghost beside the outlined Design system button: this is the thing you
          need once, and that is the thing you come back for. */}
      <Button onClick={reopen} size="sm" variant="ghost">
        <HelpIcon />
        How this works
      </Button>

      <Dialog onOpenChange={(next) => (next ? reopen() : close())} open={open}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Take a screen into your own repo</DialogTitle>
            <DialogDescription>
              Every mockup here is published as a shadcn registry item, so
              taking one is a command rather than a copy of a dozen files.
            </DialogDescription>
          </DialogHeader>

          {/* Keyed on the step so the pane is replaced rather than patched,
              which is what gives the new one its entrance. Opacity and
              transform only, and nothing at all for a reader who asked for
              less motion. */}
          <div
            className="flex animate-pane-in flex-col gap-3 motion-reduce:animate-none"
            key={current.id}
          >
            {current.figure}

            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-medium">{current.title}</h2>
              <p className="text-sm text-muted-foreground">{current.body}</p>
            </div>
          </div>

          <DialogFooter className="sm:items-center sm:justify-between">
            {/* Position, not a control: three dots read as "there is more"
                without adding a third thing to press in a footer that already
                has two. */}
            <div aria-hidden className="flex items-center gap-1.5">
              {steps.map((entry, index) => (
                <span
                  className={cn(
                    "size-1.5 rounded-full transition-colors duration-150 ease-out-cubic motion-reduce:transition-none",
                    index === step ? "bg-primary" : "bg-border",
                  )}
                  key={entry.id}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 ? (
                <Button
                  onClick={() => setStep(step - 1)}
                  size="sm"
                  variant="ghost"
                >
                  Back
                </Button>
              ) : null}

              <Button
                onClick={() => (last ? close() : setStep(step + 1))}
                size="sm"
              >
                {last ? "Got it" : "Next"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
