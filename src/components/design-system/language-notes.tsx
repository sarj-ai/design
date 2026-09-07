import {
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Badge } from "@/components/ui/badge"
import { LANGUAGES } from "@/lib/design-system-data"

/**
 * The language rule, which is one sentence: a chip with the two-letter code.
 *
 * Three languages, and no dialect — `LANGUAGES` in precedent-iso is flat ISO
 * 639-1. The names sit beside the chips here because this is the page that
 * says what the codes are; in a row there is the chip and its tooltip.
 */
export function LanguageNotes() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium">Languages</span>
        <span className="text-sm text-muted-foreground">
          A chip with the two-letter code. The full name is in its tooltip.
        </span>
      </div>

      <ReferenceTable
        columns={[{ header: "Chip", width: "w-24" }, { header: "Language" }]}
        rows={LANGUAGES.map((language) => ({
          key: language.code,
          cells: [
            <Badge
              className="bg-muted text-muted-foreground"
              key="chip"
              variant="secondary"
            >
              {language.code}
            </Badge>,
            <ReferenceNote key="name">{language.name}</ReferenceNote>,
          ],
        }))}
      />
    </section>
  )
}
