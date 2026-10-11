"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { MultiStepForm } from "@/components/design-system/multi-step-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  type Details,
  DetailsStep,
  detailsErrors,
} from "@/components/mockups/voice-cloning/details-step"
import {
  type Capture,
  EMPTY_CAPTURE,
  SampleStep,
} from "@/components/mockups/voice-cloning/sample-step"
import {
  DIALECTS,
  type Gender,
  type LanguageCode,
  type SampleOutcome,
  type Voice,
} from "@/lib/mockups/voice-cloning-data"

/**
 * The clone flow: two steps, one surface — Sample, then Preview and details.
 *
 * It is the design system's multi-step creation focus view (the steps take
 * the screen, the form sits alone in the middle) with one deliberate
 * difference: no appended Review step. `MultiStepCreateDialog` adds one
 * because a creation flow should show what it is about to make; here step 2
 * already is that — the reader hears the voice before naming it — and the
 * PRD fixes the flow at two steps.
 *
 * Next on step 1 is where the clone happens (register the profile, render the
 * preview), so it carries the submitting state and the one failure the TTS
 * service can return. The failure keeps the take: the reader retries, not
 * re-records.
 *
 * The same component opens from the Voice library and from the persona voice
 * picker; from a persona it starts on the persona's language and gender, so
 * the new voice lands in the cards that persona shows.
 */

const STEPS = [
  {
    title: "Sample",
    description:
      "Read the script in a quiet room, at your natural pace. Background noise is cloned with the voice.",
  },
  {
    title: "Preview and details",
    description: "Listen to the clone, then name it.",
  },
] as const

export function CloneVoiceFlow({
  open,
  onOpenChange,
  onCreated,
  canPublish,
  outcome,
  defaults,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (voice: Voice) => void
  canPublish: boolean
  outcome: SampleOutcome
  defaults: { language: LanguageCode; gender: Gender }
}) {
  const initialDetails = React.useMemo<Details>(
    () => ({
      name: "",
      vibe: "",
      language: defaults.language,
      dialect: DIALECTS[defaults.language][0],
      gender: defaults.gender,
      publish: false,
      consent: false,
    }),
    [defaults.language, defaults.gender],
  )

  const [step, setStep] = React.useState(0)
  const [capture, setCapture] = React.useState<Capture>(EMPTY_CAPTURE)
  const [details, setDetails] = React.useState<Details>(initialDetails)
  const [showErrors, setShowErrors] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const [attempts, setAttempts] = React.useState(0)
  const [leaving, setLeaving] = React.useState(false)

  const reset = () => {
    setStep(0)
    setCapture(EMPTY_CAPTURE)
    setDetails(initialDetails)
    setShowErrors(false)
    setBusy(false)
    setFailed(false)
    setAttempts(0)
  }

  const close = () => {
    onOpenChange(false)
    reset()
  }

  /* A take is something to lose, so every way out asks once one exists. */
  const requestClose = () => {
    if (busy) return
    if (capture.kind === "take" || step > 0) {
      setLeaving(true)
      return
    }
    close()
  }

  const take = capture.kind === "take" ? capture.take : null
  const sampleReady =
    take !== null && take.transcript !== null && take.transcript.trim() !== ""

  const clone = async () => {
    if (!sampleReady) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setFailed(false)
    setBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 1600))
    setBusy(false)
    setAttempts((count) => count + 1)
    if (outcome === "fails" && attempts === 0) {
      setFailed(true)
      return
    }
    setStep(1)
  }

  const create = async () => {
    const errors = detailsErrors(details)
    if (errors.name || errors.consent) {
      setShowErrors(true)
      return
    }
    setBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    const name = details.name.trim()
    onCreated({
      id: `clone-${name.toLowerCase()}-${Date.now()}`,
      name,
      vibe: details.vibe.trim() || null,
      provider: "Sarj Omni",
      language: details.language,
      gender: details.gender,
      status: details.publish ? "pending" : "active",
      cloned: true,
      scope: "org",
      usedBy: [],
    })
    close()
  }

  const onSample = step === 0
  const nextLabel = busy ? (
    <>
      <Spinner />
      {onSample ? "Cloning voice…" : "Creating voice…"}
    </>
  ) : onSample ? (
    "Next step"
  ) : (
    "Create voice"
  )

  return (
    <DialogPrimitive.Root
      onOpenChange={(next) => (next ? onOpenChange(true) : requestClose())}
      open={open}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-modal overflow-y-auto bg-muted duration-200 ease-out-cubic outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none">
          <DialogPrimitive.Title className="sr-only">
            Clone a voice
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {STEPS[step].description}
          </DialogPrimitive.Description>

          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-6 py-16">
            <MultiStepForm
              currentStep={step + 1}
              description={STEPS[step].description}
              nextButtonText={nextLabel}
              nextDisabled={busy}
              notice={
                failed && onSample ? (
                  <Alert className="bg-destructive-tint" variant="destructive">
                    <AlertTitle>Couldn’t clone this sample</AlertTitle>
                    <AlertDescription className="flex flex-col items-start gap-3">
                      <span>
                        The voice service didn’t answer. Your sample is kept, so
                        trying again is safe.
                      </span>
                      <Button
                        onClick={() => void clone()}
                        size="sm"
                        variant="outline"
                      >
                        Try again
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : null
              }
              onBack={() => {
                setShowErrors(false)
                setStep(0)
              }}
              onClose={requestClose}
              onNext={() => void (onSample ? clone() : create())}
              /* Forward is earned by cloning, so only going back is a jump. */
              onStepSelect={(selected) => {
                if (selected === 1 && !busy) {
                  setShowErrors(false)
                  setStep(0)
                }
              }}
              title="Clone a voice"
              totalSteps={STEPS.length}
            >
              {onSample ? (
                <SampleStep
                  capture={capture}
                  noisy={outcome === "noisy"}
                  setCapture={(next) => {
                    setFailed(false)
                    setCapture(next)
                  }}
                  showErrors={showErrors}
                />
              ) : (
                <DetailsStep
                  canPublish={canPublish}
                  details={details}
                  setDetails={setDetails}
                  showErrors={showErrors}
                />
              )}
            </MultiStepForm>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      {/* A confirm is the one overlay allowed over another. */}
      <AlertDialog onOpenChange={setLeaving} open={leaving}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this voice?</AlertDialogTitle>
            <AlertDialogDescription>
              Nothing has been created yet. Your sample isn’t kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setLeaving(false)
                close()
              }}
              variant="destructive"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogPrimitive.Root>
  )
}
