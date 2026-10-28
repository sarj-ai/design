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

/* The enum keeps the taxonomy order; only the drawing order changes here. */
const GROUPED = FLAG_CATEGORIES.filter(
  (category) => FLAG_SUBCATEGORIES[category].length > 0,
)
const STANDALONE = FLAG_CATEGORIES.filter(
  (category) => FLAG_SUBCATEGORIES[category].length === 0,
)

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

        {/* Negative margins clip rows at the dialog edge; the cap matches the design's 686px frame. */}
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
          {/* `w-0` with `flex-1`, not `min-w-0`: in a grid, a nowrap line's width otherwise pushes the buttons out. */}
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

/** `dimmed` is a look, never a lock: the row stays clickable. */
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
