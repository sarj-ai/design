"use client"

import * as React from "react"

import { CreationFlow } from "@/components/design-system/creation-flow"
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
 * The clone flow, on the design system's creation flow — the surface the
 * surfaces page gives "creating in steps": the whole screen, Back and Close at
 * the top, one question a screen under "Clone a voice", the step dots at the
 * foot, and each screen's primary button where its answer ends.
 *
 * Two screens, as the PRD fixes it: record or upload a sample, then hear the
 * clone and name it. Clone voice on the first screen is where the clone
 * happens (register the profile, render the preview), so it carries the
 * working state and the one failure the TTS service can return — which keeps
 * the take, so the reader retries rather than re-records.
 *
 * The same flow opens from the Voice library and from a persona; from a
 * persona it starts on the persona's language and gender, so the new voice
 * lands in the cards that persona shows.
 */

const STEPS = [
  {
    key: "sample",
    question:
      "Read the script aloud in a quiet room. Background noise is cloned with the voice.",
  },
  {
    key: "details",
    question: "Listen to the clone, then name it.",
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

  return (
    <>
      <CreationFlow
        direction={onSample ? -1 : 1}
        onBack={
          onSample || busy
            ? null
            : () => {
                setShowErrors(false)
                setStep(0)
              }
        }
        onClose={requestClose}
        open={open}
        question={STEPS[step].question}
        step={step}
        stepKey={STEPS[step].key}
        steps={STEPS.length}
        title="Clone a voice"
      >
        {onSample ? (
          <div className="flex flex-col gap-6">
            <SampleStep
              capture={capture}
              noisy={outcome === "noisy"}
              setCapture={(next) => {
                setFailed(false)
                setCapture(next)
              }}
              showErrors={showErrors}
            />

            {/* Which step broke, and the way to retry it — never a bare
                toast. */}
            {failed ? (
              <Alert className="bg-destructive-tint" variant="destructive">
                <AlertTitle>Couldn’t clone this sample</AlertTitle>
                <AlertDescription>
                  The voice service didn’t answer. Your sample is kept, so
                  trying again is safe.
                </AlertDescription>
              </Alert>
            ) : null}

            {/* Only once there is a take to clone: before that, the two
                choices above are the step. */}
            {capture.kind === "take" ? (
              <div className="flex justify-end">
                <Button disabled={busy} onClick={() => void clone()}>
                  {busy ? (
                    <>
                      <Spinner />
                      Cloning voice…
                    </>
                  ) : failed ? (
                    "Try again"
                  ) : (
                    "Clone voice"
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <DetailsStep
              canPublish={canPublish}
              details={details}
              setDetails={setDetails}
              showErrors={showErrors}
            />
            <div className="flex justify-end">
              <Button disabled={busy} onClick={() => void create()}>
                {busy ? (
                  <>
                    <Spinner />
                    Creating voice…
                  </>
                ) : (
                  "Create voice"
                )}
              </Button>
            </div>
          </div>
        )}
      </CreationFlow>

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
            <AlertDialogCancel>Keep going</AlertDialogCancel>
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
    </>
  )
}
