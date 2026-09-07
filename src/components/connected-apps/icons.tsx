import {
  ArrowLeft02Icon,
  ClockAlertIcon,
  Copy01Icon,
  Key01Icon,
  PlusSignIcon,
  PuzzleIcon,
  ShieldBanIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/**
 * The connected apps screen's glyphs, each named for what it does here.
 */

/** One of the organization's own systems, as opposed to a provider we ship. */
export const ConnectedAppIcon = icon(PuzzleIcon, "ConnectedAppIcon")
export const AccessTokenIcon = icon(Key01Icon, "AccessTokenIcon")

export const CreateAppIcon = icon(PlusSignIcon, "CreateAppIcon")
export const CreateTokenIcon = icon(PlusSignIcon, "CreateTokenIcon")

/* Taking a live credential out of service. A trash can would say the row
   disappears, and it does not — a revoked token stays on the list so the
   reader can see they killed the right one. */
export const RevokeTokenIcon = icon(ShieldBanIcon, "RevokeTokenIcon")

/* The one-time reveal, and the only affordance on it that matters. */
export const CopyTokenIcon = icon(Copy01Icon, "CopyTokenIcon")
export const CopiedIcon = icon(Tick02Icon, "CopiedIcon")

/** A token close enough to expiry that the list says so unprompted. */
export const NearExpiryIcon = icon(ClockAlertIcon, "NearExpiryIcon")

export const BackToIntegrationsIcon = icon(
  ArrowLeft02Icon,
  "BackToIntegrationsIcon",
)
