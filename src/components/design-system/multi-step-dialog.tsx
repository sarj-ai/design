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

/**
 * The one shell every multi-step creation uses, as a focus view: the steps
 * take the whole screen.
 *
 * It was a 672px dialog, on the reasoning that creation does not need the page
 * behind it. The surfaces research overturned the size, not the reasoning:
 * nobody measured runs steps in a medium modal. ElevenLabs' new agent,
 * Stripe's subscription and pricing table, PlayAI's agent builder and the
 * platform's own scenario and SIP wizards all take the screen, and Atlassian,
 * Primer and NN/g all say a task with its own navigation is a page. So the
 * page goes, and the form sits alone in the middle of the screen.
 *
 * It is built on the Radix primitive rather than `DialogContent`, whose box —
 * centred, capped, rounded — is the thing being replaced. Radix still gives
 * the focus trap, Esc and the portal.
 *
 * Leaving part-way asks first. Esc, the Close button and a stray click would
 * otherwise drop three screens of answers on the floor.
 *
 * The chrome — header, progress, animated body, footer — is `MultiStepForm`.
 * This file is the part that component deliberately does not have: the state
 * machine, and the three required parts a caller must not be able to omit.
 * Review is appended rather than passed, because a flow that could leave it
 * out is a flow that will; a refusal is typed, so "Back to credentials" is
 * built rather than remembered.
 *
 * `MultiStepForm` brings its own Card and its own close button, so the dialog
 * hands over its padding and its close button and lets that Card be the
 * surface. The heading is repeated hidden, because Radix names the dialog from
 * `DialogTitle` and a `CardTitle` is not one.
 */

export type CreateStep = {
  title: string
  description: string
  /** The one decision this step asks. A step that asks nothing is deleted. */
  content: React.ReactNode
}

export type SummaryRow = { term: string; value: string }

/** A refusal names the step that broke, so the shell can offer the way back. */
export type CreateFailure = {
  message: string
  stepIndex: number
  title: string
}

export function MultiStepCreateDialog({
  children,
  onCreated,
  steps,
  submit,
  submitLabel,
  submittingLabel,
  summary,
  title,
}: {
  /** The trigger. */
  children: React.ReactNode
  onCreated: () => void
  steps: CreateStep[]
  submit: () => Promise<CreateFailure | null>
  submitLabel: string
  submittingLabel: string
  summary: SummaryRow[]
  /** The object being created. Constant across every step — see below. */
  title: string
}) {
  const [open, setOpen] = React.useState(false)
  const [leaving, setLeaving] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const [submitting, setSubmitting] = React.useState(false)
  const [failure, setFailure] = React.useState<CreateFailure | null>(null)

  const total = steps.length + 1
  const reviewStep = steps.length
  const onReview = step === reviewStep
  const current = steps[step]

  /* One title across every step. It is one task, and a title that changes each
     step reads as several dialogs in a row — the call `CreateVoiceDialog` made
     before this shell existed, and the right one. The step's own name still
     exists on CreateStep, for the failure alert's way back to it; what tells
     you where you are is the stepper. */
  const description = onReview
    ? "Nothing is created until you confirm this."
    : current.description

  /* Every move clears the refusal. Without this the alert follows Back onto
     steps it does not describe — "Credentials were rejected" sitting over
     step 1 is the bare toast the rule rejects, just in a bigger box. */
  const goTo = (next: number) => {
    setStep(next)
    setFailure(null)
  }

  const reset = () => {
    setStep(0)
    setFailure(null)
    setSubmitting(false)
  }

  const create = async () => {
    setSubmitting(true)
    setFailure(null)
    const result = await submit()
    setSubmitting(false)

    if (result) {
      setFailure(result)
      return
    }

    setOpen(false)
    reset()
    onCreated()
  }

  /* Every way out comes through here. Past the first step there are answers
     to lose, so it asks; on the first there is nothing yet. */
  const requestClose = () => {
    if (step > 0 && !submitting) {
      setLeaving(true)
      return
    }
    setOpen(false)
    reset()
  }

  return (
    <DialogPrimitive.Root
      onOpenChange={(next) => (next ? setOpen(true) : requestClose())}
      open={open}
    >
      <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-modal overflow-y-auto bg-muted duration-200 ease-out-cubic outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none">
          <DialogPrimitive.Title className="sr-only">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {description}
          </DialogPrimitive.Description>

          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-6 py-16">
            <MultiStepForm
              currentStep={step + 1}
              description={description}
              nextButtonText={
                onReview ? (
                  submitting ? (
                    <>
                      <Spinner />
                      {submittingLabel}
                    </>
                  ) : (
                    submitLabel
                  )
                ) : (
                  "Next step"
                )
              }
              nextDisabled={submitting}
              notice={
                /* Which step broke, and the way back to it — never a bare toast.
               On the tint rather than the plain card: at the foot of a form it
               has to register as a refusal at a glance, and red text on white
               reads as a caption. */
                failure ? (
                  <Alert className="bg-destructive-tint" variant="destructive">
                    <AlertTitle>{failure.title}</AlertTitle>
                    <AlertDescription className="flex flex-col items-start gap-3">
                      <span>{failure.message}</span>
                      <Button
                        onClick={() => goTo(failure.stepIndex)}
                        size="sm"
                        variant="outline"
                      >
                        Back to {steps[failure.stepIndex].title.toLowerCase()}
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : null
              }
              onBack={() => goTo(step - 1)}
              /* The stepper counts from 1, the state from 0. */
              onStepSelect={(selected) => goTo(selected - 1)}
              onClose={requestClose}
              onNext={() => (onReview ? void create() : goTo(step + 1))}
              title={title}
              totalSteps={total}
            >
              <div className="flex flex-col gap-6">
                {onReview ? (
                  <dl className="flex flex-col gap-3">
                    {summary.map((row) => (
                      <div className="flex flex-col gap-0.5" key={row.term}>
                        <dt className="text-sm text-muted-foreground">
                          {row.term}
                        </dt>
                        <dd className="text-sm">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  current.content
                )}
              </div>
            </MultiStepForm>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      {/* A confirm is the one overlay allowed over another. */}
      <AlertDialog onOpenChange={setLeaving} open={leaving}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your answers?</AlertDialogTitle>
            <AlertDialogDescription>
              Nothing has been created yet. Leaving now keeps nothing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setLeaving(false)
                setOpen(false)
                reset()
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
