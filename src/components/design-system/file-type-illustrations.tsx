import { FileCard } from "@/components/ui/file-card-collections"
import { SOURCE_LABELS, type SourceKind } from "@/lib/knowledge-base-data"

/**
 * A card per source a knowledge base accepts, for the places a row of text
 * does not carry what kind of thing is being added — an upload picker, an
 * empty state, the choice between adding a file and adding a URL.
 *
 * Keyed off `SourceKind` rather than a list of its own, so a source added to
 * the product cannot quietly go unillustrated. `url` and `text` are absent
 * because neither is a file: a link and a pasted paragraph have no document
 * to draw, and drawing one would say they were uploaded.
 */
const CARD_FORMAT = {
  pdf: "pdf",
  docx: "doc",
  txt: "txt",
  markdown: "md",
} as const satisfies Partial<Record<SourceKind, string>>

/**
 * The rest of what the component can draw, one per distinct illustration —
 * `xlsx` is `xls`, `pptx` is `ppt`, `rar`/`tar`/`gz` are `zip`, `png`/`jpg`
 * are `img`, and `html`/`js`/`jsx`/`tsx` are `code`, so showing each twin
 * would pad the row without adding a drawing.
 *
 * Kept apart from the set above because none of it is a source a knowledge
 * base accepts. It is here so nobody rebuilds a spreadsheet card that already
 * exists, not because the product ingests one.
 */
const OTHER_FORMATS = [
  "csv",
  "xls",
  "ppt",
  "zip",
  "code",
  "css",
  "json",
  "img",
  "video",
] as const

export function FileTypeIllustrations() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">
          Sources a knowledge base takes
        </span>
        <div className="flex flex-wrap items-end gap-6">
          {Object.entries(CARD_FORMAT).map(([kind, format]) => (
            <div className="flex flex-col items-center gap-2" key={kind}>
              <FileCard formatFile={format} />
              <span className="text-xs text-muted-foreground">
                {SOURCE_LABELS[kind as SourceKind]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">
          Also drawn, not ingested today
        </span>
        <div className="flex flex-wrap items-end gap-6">
          {OTHER_FORMATS.map((format) => (
            <div className="flex flex-col items-center gap-2" key={format}>
              <FileCard formatFile={format} />
              <span className="text-xs text-muted-foreground uppercase">
                {format}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
