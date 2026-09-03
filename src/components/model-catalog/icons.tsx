import {
  Alert02Icon,
  ArrowLeft01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  CloudOffIcon,
  CpuIcon,
  InformationCircleIcon,
  PlugSocketIcon,
  PlusSignIcon,
  RefreshIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/**
 * The model catalog's glyphs, each named for what it does on this screen.
 */

/** The catalog with nothing in it yet, and the button that fixes that. */
export const ModelIcon = icon(CpuIcon, "ModelIcon")
export const AddModelIcon = icon(PlusSignIcon, "AddModelIcon")
export const SearchIcon = icon(Search01Icon, "SearchIcon")

/** The (i) beside a field whose consequence its own label cannot carry. */
export const FieldHelpIcon = icon(InformationCircleIcon, "FieldHelpIcon")

/** The (i) beside a model that carries a compatibility note. */
export const NoteIcon = icon(InformationCircleIcon, "NoteIcon")

/* Connecting a provider we have never reached before — the heavier of the two
   add paths, so it carries its own mark rather than sharing the plus, and its
   own way back to the light one. */
export const NewProviderIcon = icon(PlugSocketIcon, "NewProviderIcon")
export const BackToPickerIcon = icon(ArrowLeft01Icon, "BackToPickerIcon")

/* The two answers the connection test can give. */
export const TestPassedIcon = icon(CheckmarkCircle02Icon, "TestPassedIcon")
export const TestFailedIcon = icon(CancelCircleIcon, "TestFailedIcon")

/* A live fetch that timed out — not a failure of the model, which is why it
   reads as a notice with a way forward and not as an error. */
export const FetchWarningIcon = icon(Alert02Icon, "FetchWarningIcon")
export const RetryIcon = icon(RefreshIcon, "RetryIcon")

/** The catalog itself failing to load. */
export const LoadFailedIcon = icon(CloudOffIcon, "LoadFailedIcon")
