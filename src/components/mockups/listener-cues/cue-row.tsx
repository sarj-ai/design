"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import type { Cue } from "@/lib/mockups/listener-cues-data"

import { PreviewCueIcon, RemoveCueIcon } from "./icons"

export function CueRow({
  canRemove,
  cue,
  disabled,
  onRemove,
  onWeightChange,
  weight,
}: {
  canRemove: boolean
  cue: Cue
  disabled: boolean
  onRemove: () => void
  onWeightChange: (weight: number) => void
  /** The rounded share shown to the reader — the stored weight is exact. */
  weight: number
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <Button
            aria-label={`Preview ${cue.label}`}
            size="icon-sm"
            variant="outline"
          >
            <PreviewCueIcon />
          </Button>

          <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
            {/* dir="auto" on a box that hugs the text; filling the column would take the column's direction. */}
            <span className="max-w-full truncate font-medium" dir="auto">
              {cue.label}
            </span>
            <span className="text-xs text-muted-foreground">
              Saved voice clip
            </span>
          </div>

          <Badge variant="secondary" className="tabular-nums">
            {weight}%
          </Badge>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                aria-label={`Remove ${cue.label}`}
                disabled={disabled || !canRemove}
                size="icon-sm"
                variant="ghost"
              >
                <RemoveCueIcon />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <RemoveCueIcon />
                </AlertDialogMedia>
                <AlertDialogTitle>
                  Remove <span dir="auto">{cue.label}</span> from the mix?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Its {weight}% share is spread across the remaining cues. The
                  clip stays in the approved set, so it can be added back at any
                  time.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onRemove} variant="destructive">
                  Remove cue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Slider
          aria-label={`Share of playback for ${cue.label}, percent`}
          disabled={disabled}
          max={100}
          min={0}
          onValueChange={([next]) => onWeightChange(next)}
          step={1}
          value={[weight]}
        />

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>0%</span>
          <span>Auto-balanced</span>
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  )
}
