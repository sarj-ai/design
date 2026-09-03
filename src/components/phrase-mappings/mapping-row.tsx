"use client"

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field"
import {
  MAX_TRIGGERS,
  type Conflict,
  type Mapping,
  type PreviewVoice,
  textDirection,
} from "@/lib/phrase-mappings-data"
import { cn } from "@/lib/utils"

import { DeleteMappingIcon, RespondsWithIcon } from "./icons"
import { ResponseField } from "./response-field"
import { TriggerField } from "./trigger-field"

/**
 * One mapping, collapsed to a line until it is being edited.
 *
 * What is *not* here is the point of this round. The row used to carry a
 * priority number, a match-mode select and an on/off switch beside the two
 * fields that actually define the rule. Review, Fatma, Aug 2026 took all three
 * out, and they came out together because they held each other up: matching is
 * whole-utterance only, so an utterance reaches at most one rule; with no two
 * rules competing there is nothing for a priority to order; and with no order
 * to protect, pausing a rule stops being a way to resolve anything, which was
 * the only argument for it over deleting.
 *
 * What is left is the rule: the phrases that trigger it, and what the agent
 * says back.
 *
 * An inherited row keeps every control and disables it. The row used to swap
 * its editors for plain values and drop its delete button, which meant three
 * different answers to "why can't I touch this?" in one panel. One answer now:
 * the control is there, and it is dead.
 */
export function MappingRow({
  conflicts,
  disabled,
  fieldId,
  mapping,
  onChange,
  onRemove,
  voice,
}: {
  conflicts: Conflict[]
  /** Persona scope only: the inherited global set, shown but not editable. */
  disabled: boolean
  fieldId: string
  mapping: Mapping
  onChange: (mapping: Mapping) => void
  onRemove: () => void
  /** The voice this scope's responses are previewed in. */
  voice: PreviewVoice
}) {
  const set = (patch: Partial<Mapping>) => onChange({ ...mapping, ...patch })

  const contested = conflicts.some((conflict) =>
    conflict.mappingIds.includes(mapping.id),
  )

  /* The row summarises the rule as the pair it is. Review: the response alone
     read as a list of unexplained answers with no sign of what the caller has
     to say to get one. One phrase makes the rule legible; the rest are a
     count, and all of them are one click away. */
  const [firstTrigger, ...restTriggers] = mapping.triggers

  /* Resolved, not `auto` — the arrow between the pair has to mirror with it,
     and `rtl:` cannot see through `dir="auto"`. See `textDirection`. */
  const pairDirection = textDirection(firstTrigger ?? "", mapping.response)

  /* Names the row for the delete dialog before anything is typed into it. */
  const name = mapping.response.trim() || firstTrigger || "this mapping"

  /* `not-last:border-b-0`, not `border-b-0`: the primitive draws its divider
     under a variant, which outranks a bare override on specificity — so the
     plain version left a hairline under every row but the last. Each row is a
     Card here, and the Card's ring is the only edge it should have. */
  return (
    <AccordionItem className="not-last:border-b-0" value={mapping.id}>
      <Card
        /* Hover belongs to the card, not to the trigger inside it.
           `hover:bg-muted` on the trigger painted a `rounded-lg` pill inside a
           `rounded-xl` card, inset a few pixels on one side and a couple of
           hundred on the other where the actions begin — a second surface
           inside the surface, aligned to neither. The card is already the row;
           tinting the card tints the row, edge to edge, on its own radius. */
        className={cn(
          "transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none",
          contested && "ring-destructive",
        )}
        size="sm"
      >
        <CardContent className="flex flex-col">
          <div className="flex items-center gap-2">
            {/* `*:flex-1` stretches the primitive's own header, which is
                otherwise only as wide as its content — that parked the chevron
                against the meta text, where it read as a menu on that text
                rather than as the row opening. Stretched, every row's chevron
                lands in the same column, and a column of chevrons is what a
                reader recognises as "these expand". */}
            <div className="flex min-w-0 flex-1 *:min-w-0 *:flex-1">
              {/* No underline on hover: the summary is a phrase and a response,
                  and a rule drawn under both reads as one long link rather than
                  as a row that opens. The card's own tint says it instead.

                  No horizontal padding either, so the phrase starts on the same
                  inline edge as everything in the expanded body below it. */}
              <AccordionTrigger className="items-center py-1.5 hover:no-underline hover:**:data-[slot=accordion-trigger-icon]:text-foreground">
                <span className="flex min-w-0 items-center gap-2">
                  {/* Phrase and response in one `dir="auto"` run, not two:
                      given the pair together the paragraph direction is read
                      off the caller phrase, so an Arabic rule lays itself out
                      right-to-left and the arrow mirrors with it. Split into
                      two spans each would resolve its own direction and the
                      arrow would point out of the sentence.

                      Both are capped rather than left to flex-shrink — the
                      accordion's own header cannot shrink below its content,
                      so a long response used to push the meta and the conflict
                      badge out under the actions instead of truncating. */}
                  <span
                    className="flex min-w-0 items-center gap-1.5"
                    dir={pairDirection}
                  >
                    <span
                      className={cn(
                        "max-w-48 truncate",
                        !firstTrigger && "text-muted-foreground",
                      )}
                    >
                      {firstTrigger ?? "No phrase yet"}
                    </span>

                    <RespondsWithIcon className="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />

                    <span
                      className={cn(
                        "max-w-48 truncate",
                        !mapping.response.trim() && "text-muted-foreground",
                      )}
                    >
                      {mapping.response.trim() || "New mapping"}
                    </span>
                  </span>

                  {/* "+2" rather than "3 phrases": one of the three is on the
                      row, so the count that matters is how many more there are
                      behind it. Nothing at all when there are none. */}
                  {restTriggers.length > 0 ? (
                    <span className="shrink-0 text-xs font-normal text-muted-foreground">
                      +{restTriggers.length}
                    </span>
                  ) : null}

                  {contested ? (
                    <Badge className="shrink-0" variant="destructive">
                      Conflict
                    </Badge>
                  ) : null}
                </span>
              </AccordionTrigger>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  aria-label={`Delete ${name}`}
                  disabled={disabled}
                  size="icon-sm"
                  variant="ghost"
                >
                  <DeleteMappingIcon />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <DeleteMappingIcon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>
                    Delete <span dir="auto">{name}</span>?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Its{" "}
                    {mapping.triggers.length === 1
                      ? "caller phrase falls"
                      : `${mapping.triggers.length} caller phrases fall`}{" "}
                    back to the generic filler words.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onRemove} variant="destructive">
                    Delete mapping
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <AccordionContent className="flex flex-col gap-4 pt-3 pb-1">
            <Field>
              {/* FieldTitle, not FieldLabel: the control below is a chip list
                  and an input, so there is no single id to point at. */}
              <div className="flex items-center justify-between gap-2">
                <FieldTitle>When caller says</FieldTitle>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {mapping.triggers.length}/{MAX_TRIGGERS} phrases
                </span>
              </div>
              <FieldDescription>
                The caller has to say the phrase and nothing else. Punctuation,
                diacritics and spelling variants are ignored.
              </FieldDescription>
              <TriggerField
                conflicts={conflicts}
                disabled={disabled}
                onAdd={(trigger) =>
                  set({ triggers: [...mapping.triggers, trigger] })
                }
                onRemove={(trigger) =>
                  set({
                    triggers: mapping.triggers.filter(
                      (value) => value !== trigger,
                    ),
                  })
                }
                triggers={mapping.triggers}
              />
            </Field>

            <ResponseField
              disabled={disabled}
              fieldId={fieldId}
              onChange={(response) => set({ response })}
              value={mapping.response}
              voice={voice}
            />
          </AccordionContent>
        </CardContent>
      </Card>
    </AccordionItem>
  )
}
