"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  CALL,
  FLAG_CATEGORIES,
  FLAG_CATEGORY_LABELS,
  FLAG_SUBCATEGORIES,
  FLAG_SUBCATEGORY_RULES,
  INITIAL_FLAG,
  UNSPECIFIED_SUBCATEGORY_LABEL,
  subcategoryLabel,
  type FlagCategory,
} from "@/lib/mockups/call-flagging-data"

type Selection = {
  category: FlagCategory | null
  subcategories: string[]
}

const NOTHING: Selection = { category: null, subcategories: [] }

/* Categories with subcategories draw as a labelled group of rows. The ones
   with none are a single row each, so they close the list as one block rather
   than sitting between the groups looking like a stray subcategory. The enum
   keeps DIS-50's order; only the drawing order moves. */
const GROUPED = FLAG_CATEGORIES.filter(
  (category) => FLAG_SUBCATEGORIES[category].length > 0,
)
const STANDALONE = FLAG_CATEGORIES.filter(
  (category) => FLAG_SUBCATEGORIES[category].length === 0,
)

/**
 * Flag this call — one moment, filed under one parent category.
 *
 * The list is the DIS-50 taxonomy. A flag belongs to one parent and carries
 * any number of that parent's subcategories: the first row ticked commits the
 * flag to its parent and every other group dims. Dimmed is not disabled — a
 * row in another group is one click away, and ticking it moves the flag there
 * and drops the previous parent's ticks, so changing your mind never means
 * unticking everything first. Nothing captions the dimmed groups — the ticked
 * rows above them are the explanation.
 *
 * Latency is the one parent whose subcategories are optional, because the
 * person flagging often cannot tell which stage was slow. It gets a "Not sure"
 * row that submits latency with no subcategory. The four parents with nothing
 * beneath them are plain rows under the divider.
 *
 * The footer reads the flag back as "category - subcategories" so it can be
 * checked without scrolling, and Save stays disabled until there is a flag.
 */
export function FlagCallDialog() {
  const [open, setOpen] = React.useState(true)
  const [selection, setSelection] = React.useState<Selection>({
    category: INITIAL_FLAG.category,
    subcategories: [...INITIAL_FLAG.subcategories],
  })

  const { category: active, subcategories: ticked } = selection

  function toggleSubcategory(
    category: FlagCategory,
    id: string,
    checked: boolean,
  ) {
    const current = active === category ? ticked : []
    const next = checked
      ? [...current, id]
      : current.filter((other) => other !== id)

    setSelection(
      next.length === 0 ? NOTHING : { category, subcategories: next },
    )
  }

  /* The whole category with no subcategory: a standalone parent, or the
     "Not sure" row of an optional one. */
  function toggleCategory(category: FlagCategory, checked: boolean) {
    setSelection(checked ? { category, subcategories: [] } : NOTHING)
  }

  const complete =
    active !== null &&
    (FLAG_SUBCATEGORY_RULES[active] !== "required" || ticked.length > 0)

  /* In list order, not tick order, so the readout matches the rows above. */
  const summary =
    active === null
      ? null
      : [
          FLAG_CATEGORY_LABELS[active],
          FLAG_SUBCATEGORIES[active]
            .filter((id) => ticked.includes(id))
            .map((id) => subcategoryLabel(active, id))
            .join(", "),
        ]
          .filter(Boolean)
          .join(" - ")

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">Flag this call</Button>
      </DialogTrigger>

      {/* Nothing is autofocused: the design shows the dialog at rest, and a
          focus ring on the first checkbox reads as a styling change. */}
      <DialogContent
        className="sm:max-w-120"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Flag this call</DialogTitle>
          <DialogDescription>
            {CALL.timestamp} into call{" "}
            <span className="font-medium text-foreground">#{CALL.id}</span>
          </DialogDescription>
        </DialogHeader>

        {/* ScrollArea instead of overflow-y-auto: the bar is an overlay, so the
            checkbox column keeps its edge. The negative margins let rows clip
            at the dialog's own edge and at the footer border. The cap is the
            height that lands the dialog on the design's 686px frame. */}
        <ScrollArea className="-mx-4 -mb-4 [&>[data-slot=scroll-area-viewport]]:max-h-133">
          <div className="flex flex-col gap-3 px-4 pt-3.5 pb-4">
            {GROUPED.map((category) => {
              const dimmed = active !== null && active !== category

              return (
                <FieldSet key={category}>
                  <FieldLegend
                    className={cn(
                      "mb-1 text-xs text-muted-foreground",
                      dimmed && "opacity-50",
                    )}
                    variant="label"
                  >
                    {FLAG_CATEGORY_LABELS[category]}
                  </FieldLegend>

                  <FieldGroup className="gap-2">
                    {FLAG_SUBCATEGORIES[category].map((id) => (
                      <FlagRow
                        checked={active === category && ticked.includes(id)}
                        id={`flag-${category}-${id}`}
                        key={id}
                        label={subcategoryLabel(category, id)}
                        dimmed={dimmed}
                        onCheckedChange={(checked) =>
                          toggleSubcategory(category, id, checked)
                        }
                      />
                    ))}

                    {FLAG_SUBCATEGORY_RULES[category] === "optional" ? (
                      <FlagRow
                        checked={active === category && ticked.length === 0}
                        id={`flag-${category}-unspecified`}
                        label={UNSPECIFIED_SUBCATEGORY_LABEL}
                        dimmed={dimmed}
                        onCheckedChange={(checked) =>
                          toggleCategory(category, checked)
                        }
                      />
                    ) : null}
                  </FieldGroup>
                </FieldSet>
              )
            })}

            <Separator />

            <FieldGroup className="gap-2">
              {STANDALONE.map((category) => (
                <FlagRow
                  checked={active === category}
                  id={`flag-${category}`}
                  key={category}
                  label={FLAG_CATEGORY_LABELS[category]}
                  dimmed={active !== null && active !== category}
                  onCheckedChange={(checked) =>
                    toggleCategory(category, checked)
                  }
                />
              ))}
            </FieldGroup>
          </div>
        </ScrollArea>

        <DialogFooter className="sm:items-center">
          {/* `w-0` with `flex-1`, not `min-w-0`: the dialog is a grid, and a
              nowrap line's full width otherwise counts toward the footer's
              minimum, which pushed the buttons out past the dialog's edge. */}
          {summary ? (
            <p
              className="w-0 flex-1 truncate text-sm text-muted-foreground"
              title={summary}
            >
              {summary}
            </p>
          ) : null}
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!complete} onClick={() => setOpen(false)}>
            Save flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * One tickable line: a subcategory, a "Not sure", or a standalone parent.
 *
 * `dimmed` is a look, never a lock: the row belongs to a parent other than the
 * flagged one, and it stays fully clickable. Hovering lifts the dimming so it
 * does not read as disabled at the moment someone reaches for it.
 */
function FlagRow({
  id,
  label,
  checked,
  dimmed,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  dimmed: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <Field
      className={cn(dimmed && "opacity-50 hover:opacity-100")}
      orientation="horizontal"
    >
      <Checkbox
        checked={checked}
        id={id}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <FieldLabel className="font-normal" htmlFor={id}>
        {label}
      </FieldLabel>
    </Field>
  )
}
