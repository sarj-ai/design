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
} from "@/lib/mockups/eou-timing-data"

import { FieldHelpIcon, ScopeNoteIcon } from "./icons"
import { WaitWindow, type WaitWindowValue } from "./wait-window"

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
            <SelectContent position="popper">
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
