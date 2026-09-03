"use client"

import * as React from "react"

import { MultiStepForm } from "@/components/design-system/multi-step-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

/**
 * The one shell every multi-step creation uses.
 *
 * Creation is a modal — "you do not need the page behind it", the same rule
 * that puts create voice and create API key in one. Multi-step creation is
 * that rule plus a step count, so it is the same surface, not a new one.
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

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
      open={open}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="p-0 sm:max-w-2xl" showCloseButton={false}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

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
          onClose={() => setOpen(false)}
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
      </DialogContent>
    </Dialog>
  )
}
