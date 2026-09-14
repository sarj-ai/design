import type {
  Variable,
  VariableKind,
} from "@/lib/mockups/variable-mentions-data"
import { cn } from "@/lib/utils"

/**
 * The three colour directions the ticket asks to compare, on one chip anatomy.
 *
 * The anatomy never changes: an inline box the height of one text line,
 * `rounded-sm`, `px-1.5`, `text-xs font-medium`, the variable's name as typed.
 * It sits in running prose, so it is sized to the line rather than to the
 * `Badge` pill — a pill in a paragraph reads as a status, not as a word.
 */
export type ChipTreatment = "each" | "kind" | "one"

export const CHIP_TREATMENTS: { label: string; value: ChipTreatment }[] = [
  { label: "One", value: "one" },
  { label: "By kind", value: "kind" },
  { label: "Per variable", value: "each" },
]

const BASE =
  "inline-flex h-5 max-w-full items-center rounded-sm px-1 align-baseline text-xs font-medium whitespace-nowrap select-none"

/** The product's existing variable tint — what every chip is today. */
const ONE = "bg-variable-background text-variable"

/**
 * One tint per source. Scenario variables keep the product's blue because
 * they are the ones an author has to supply; global variables take the brand
 * tint; system information sits quietest, in the same grey as a `Kbd`, for
 * a value the platform fills in on its own.
 */
const BY_KIND: Record<VariableKind, string> = {
  scenario: ONE,
  global: "bg-primary-tint text-primary-tint-foreground",
  system: "bg-secondary text-secondary-foreground",
}

/**
 * Six tints, then it repeats. The chart ramp is the only per-item colour
 * set the system has, and it was built for fills — none of its steps is a
 * text colour on its own tint, so the foreground has to stay `foreground`.
 * The Sizzler prompt has eleven variables; two of them share a colour.
 */
const RAMP = [
  "bg-chart-1/25 text-foreground",
  "bg-chart-2/25 text-foreground",
  "bg-chart-3/30 text-foreground",
  "bg-chart-4/25 text-foreground",
  "bg-chart-5/25 text-foreground",
  "bg-chart-6/25 text-foreground",
]

/**
 * A name nothing defines: the variable was deleted, or the prompt was pasted
 * from a scenario that had it. Dashed, so the state does not rest on colour
 * alone.
 */
const NOT_DEFINED =
  "border border-dashed border-destructive/60 bg-destructive-tint text-destructive-tint-foreground"

export function chipClass(
  variable: Variable | undefined,
  treatment: ChipTreatment,
  /** The variable's position in the mentionable list — the ramp keys off it. */
  index: number,
): string {
  if (!variable) return cn(BASE, NOT_DEFINED)
  if (treatment === "one") return cn(BASE, ONE)
  if (treatment === "kind") return cn(BASE, BY_KIND[variable.kind])
  return cn(BASE, RAMP[index % RAMP.length])
}
