import { Alert02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/** A maximum outside the recommended band. */
export const OutOfBandIcon = icon(Alert02Icon, "OutOfBandIcon")

/** Scope and timing of what a save here actually changes. */
export const ScopeNoteIcon = icon(InformationCircleIcon, "ScopeNoteIcon")

/**
 * What a field does, parked in the field rather than printed under it.
 *
 * The circled "i", not a "?". Two reasons: the platform's own hover-help is
 * `components/scenario/tools/form-components/tooltip-help.tsx` and it uses
 * Info, and this screen was already using Info for the scope note — so it was
 * carrying two different help glyphs at once.
 */
export const FieldHelpIcon = icon(InformationCircleIcon, "FieldHelpIcon")
