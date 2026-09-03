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
import type { Cue } from "@/lib/listener-cues-data"

import { PreviewCueIcon, RemoveCueIcon } from "./icons"

/**
 * One saved clip in the mix.
 *
 * The share is a slider rather than a number field because the only way to
 * change one is to change the others: the mix is a division of 100%, so the
 * control that sets it should look like a proportion, not like a value typed
 * on its own.
 */
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
        {/* Top-aligned, not centred. Centring a 28px button in the 38px
            two-line column inset it 5px, so the first thing you see sat 17px
            below the card edge while the last row sat 12px above it — the card
            read as top-padded even though its padding is a symmetric 12/12. */}
        <div className="flex items-start gap-3">
          {/* Outline, not ghost: previewing a clip is the one thing the PRD
              asks this row to let you do before saving, and a ghost button on
              a card reads as a glyph rather than a control until you hover it.
              Delete stays ghost — it is destructive, so it should be the
              quieter of the two. */}
          <Button
            aria-label={`Preview ${cue.label}`}
            size="icon-sm"
            variant="outline"
          >
            <PreviewCueIcon />
          </Button>

          <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
            {/* dir="auto" so an Arabic clip reads right-to-left. The box hugs
                the text — left to fill the column it would take the column's
                own direction and strand the word at the far end. */}
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

          {/* Removing a cue also moves every other share, so it is confirmed
              rather than immediate — and the confirmation says what actually
              changes instead of asking whether you are sure. */}
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
          {/* Named on every row because it is the rule the row obeys: moving
              this share moves the others. */}
          <span>Auto-balanced</span>
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  )
}
