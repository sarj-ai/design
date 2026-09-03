"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DETECTION_MODELS,
  SAVED_GLOBAL,
  type DetectionModelId,
} from "@/lib/eou-timing-data"

import { FieldHelpIcon, ScopeNoteIcon } from "./icons"
import { WaitWindow, type WaitWindowValue } from "./wait-window"

/**
 * Turn Detection in Global Settings — PRD requirements 1 and 3.
 *
 * "The detection model selector and the wait values appear together, so a user
 * selecting a model can see the timing that will apply to it." The window
 * therefore belongs to the model that uses it, and disappears for VAD, which
 * has no semantic verdict to wait on.
 */
export function GlobalTurnDetection({
  onWindowChange,
  window,
}: {
  onWindowChange: (value: WaitWindowValue) => void
  window: WaitWindowValue
}) {
  const [modelId, setModelId] = React.useState<DetectionModelId>(
    SAVED_GLOBAL.detectionModelId,
  )
  const model =
    DETECTION_MODELS.find((entry) => entry.id === modelId) ??
    DETECTION_MODELS[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Turn Detection (EOU)</CardTitle>
        <CardDescription>
          Choose how the agent decides when the caller has finished speaking.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <Field>
          {/* Which languages a model covers is a fact about the option, not an
              instruction for using the control — so it sits on the (i) rather
              than under the select. Helper-text rule, Fatma, Aug 2026. */}
          <div className="flex items-center gap-1">
            <FieldLabel htmlFor="detection-model">Detection model</FieldLabel>
            <Tooltip>
              <TooltipTrigger
                aria-label="Language support"
                className="cursor-help text-muted-foreground"
              >
                <FieldHelpIcon className="size-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                {model.support}
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            onValueChange={(next) => setModelId(next as DetectionModelId)}
            value={modelId}
          >
            <SelectTrigger id="detection-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DETECTION_MODELS.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {model.semantic ? (
          <>
            <Separator />

            {/* The scope note used to be a two-sentence Alert under the
                window. It is neither destructive nor irreversible, so by the
                helper-text rule it belongs on a hover target — and the PRD's
                requirement is that new-calls-only is *stated*, which it still
                is. Flagged on DES-173 in case Fatma wants it back inline. */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">Wait window</span>
                <Tooltip>
                  <TooltipTrigger
                    aria-label="What these values apply to"
                    className="cursor-help text-muted-foreground"
                  >
                    <ScopeNoteIcon className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">
                    Applies to every persona that has not overridden it, on new
                    calls only.
                  </TooltipContent>
                </Tooltip>
              </div>
              <WaitWindow
                idPrefix="global"
                onChange={onWindowChange}
                value={window}
              />
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
