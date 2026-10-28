import type {
  Variable,
  VariableKind,
} from "@/lib/mockups/variable-mentions-data"
import { cn } from "@/lib/utils"

export type ChipTreatment = "each" | "kind" | "one"

export const CHIP_TREATMENTS: { label: string; value: ChipTreatment }[] = [
  { label: "One", value: "one" },
  { label: "By kind", value: "kind" },
  { label: "Per variable", value: "each" },
]

const BASE =
  "inline-flex h-5 max-w-full items-center rounded-sm px-1 align-baseline text-xs font-medium whitespace-nowrap select-none"

const ONE = "bg-variable-background text-variable"

const BY_KIND: Record<VariableKind, string> = {
  scenario: ONE,
  global: "bg-primary-tint text-primary-tint-foreground",
  system: "bg-secondary text-secondary-foreground",
}

/** The chart ramp has no text-on-tint steps, so the foreground stays `foreground`. */
const RAMP = [
  "bg-chart-1/25 text-foreground",
  "bg-chart-2/25 text-foreground",
  "bg-chart-3/30 text-foreground",
  "bg-chart-4/25 text-foreground",
  "bg-chart-5/25 text-foreground",
  "bg-chart-6/25 text-foreground",
]

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
