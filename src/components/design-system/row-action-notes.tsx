import {
  DeleteIcon,
  EditRowIcon,
  RowMenuIcon,
} from "@/components/design-system/icons"
import {
  ReferenceLabel,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Button } from "@/components/ui/button"

/**
 * The three shapes a row action takes, and the order to reach for them in.
 *
 * They are one decision, not three: what a control looks like on a row is
 * settled by whether a glyph exists for it and by how many controls the row
 * already carries. Kept beside the table rather than on the Buttons page,
 * because the sizes here are the row's, not the page's.
 *
 * The table above shows none of the worded form, and that is the rule working
 * rather than the rule being broken: edit and delete both have a glyph every
 * reader knows, so neither earns a word. The row keeps the word for the day it
 * carries an action nothing mimes.
 */
export function RowActionNotes() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium">Row actions</span>
        <span className="text-sm text-muted-foreground">
          A word, an icon, or the overflow — in that order, and never more than
          three on one row. The icons are the default size and take the row to
          48px; the word stays a size down, because it is wide enough to be an
          easy target without the height.
        </span>
      </div>

      <ReferenceTable
        columns={[
          { header: "Control", width: "w-32" },
          { header: "What it is", width: "w-56" },
          { header: "When" },
        ]}
        rows={[
          {
            key: "word",
            cells: [
              <Button key="c" size="sm" variant="outline">
                Transcript
              </Button>,
              <ReferenceLabel key="w">
                size=&quot;sm&quot; variant=&quot;outline&quot;
              </ReferenceLabel>,
              <ReferenceNote key="n">
                The action has no glyph a reader already knows — nothing mimes
                “Transcript” or “Set as default”. One per row at most, and only
                on the rows it applies to: over a call that has not happened
                yet, a Transcript button is a control with nothing to act on.
              </ReferenceNote>,
            ],
          },
          {
            key: "icon",
            cells: [
              <span className="flex items-center gap-1" key="c">
                <Button aria-label="Edit" size="icon-sm" variant="ghost">
                  <EditRowIcon />
                </Button>
                <Button
                  aria-label="Delete"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  size="icon-sm"
                  variant="ghost"
                >
                  <DeleteIcon />
                </Button>
              </span>,
              <ReferenceLabel key="w">
                size=&quot;icon-sm&quot; variant=&quot;ghost&quot;
              </ReferenceLabel>,
              <ReferenceNote key="n">
                Edit and delete — conventional glyphs every row carries, where a
                word would be the same word down the whole column. Delete
                carries the destructive colour on the glyph and nothing else:
                the filled variant tints a box, and a column of tinted boxes
                reads as a warning about the table rather than about the action.
                Always an aria-label naming the row, because the glyph is the
                only name it has.
              </ReferenceNote>,
            ],
          },
          {
            key: "overflow",
            cells: [
              <Button aria-label="More" key="c" size="icon-sm" variant="ghost">
                <RowMenuIcon />
              </Button>,
              <ReferenceLabel key="w">
                size=&quot;icon-sm&quot; variant=&quot;ghost&quot;
              </ReferenceLabel>,
              <ReferenceNote key="n">
                The fourth control, and everything after it. Past one word and
                two icons the column is wider than the data beside it, and a
                third glyph is one nobody has a convention for — so the rest go
                behind the dots rather than onto the row.
              </ReferenceNote>,
            ],
          },
        ]}
      />
    </section>
  )
}
