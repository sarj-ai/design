"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LANGUAGE_NAMES,
  PERSONAS,
  type LanguageCode,
} from "@/lib/mockups/language-switching-data"

/**
 * One persona for one language — the platform's own persona Select, offering
 * only personas in that language.
 */
export function PersonaPicker({
  disabled = false,
  id,
  invalid = false,
  language,
  onChange,
  value,
}: {
  disabled?: boolean
  id: string
  invalid?: boolean
  language: LanguageCode
  onChange: (personaId: string) => void
  value: string | null
}) {
  const options = PERSONAS.filter((persona) => persona.language === language)

  return (
    <Select
      disabled={disabled}
      onValueChange={onChange}
      value={value ?? undefined}
    >
      <SelectTrigger aria-invalid={invalid} className="w-full" id={id}>
        <SelectValue placeholder="Choose a persona" />
      </SelectTrigger>
      <SelectContent position="popper">
        {options.length > 0 ? (
          options.map((persona) => (
            <SelectItem key={persona.id} value={persona.id}>
              <bdi>{persona.name}</bdi>
            </SelectItem>
          ))
        ) : (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            No {LANGUAGE_NAMES[language]} personas yet
          </p>
        )}
      </SelectContent>
    </Select>
  )
}
