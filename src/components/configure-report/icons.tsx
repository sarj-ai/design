import {
  AlertCircleIcon,
  Cancel01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/** Takes one column back out of the export. */
export const RemoveColumnIcon = icon(Cancel01Icon, "RemoveColumnIcon")

/** Opens a group's column picker. */
export const AddColumnIcon = icon(PlusSignIcon, "AddColumnIcon")

/** Marks the note about the export running in the background. */
export const BackgroundTaskIcon = icon(AlertCircleIcon, "BackgroundTaskIcon")
