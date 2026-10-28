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

import { icon } from "@/components/shared/icon"

export const ModelIcon = icon(CpuIcon, "ModelIcon")
export const AddModelIcon = icon(PlusSignIcon, "AddModelIcon")
export const SearchIcon = icon(Search01Icon, "SearchIcon")

export const FieldHelpIcon = icon(InformationCircleIcon, "FieldHelpIcon")

export const NoteIcon = icon(InformationCircleIcon, "NoteIcon")

export const NewProviderIcon = icon(PlugSocketIcon, "NewProviderIcon")
export const BackToPickerIcon = icon(ArrowLeft01Icon, "BackToPickerIcon")

export const TestPassedIcon = icon(CheckmarkCircle02Icon, "TestPassedIcon")
export const TestFailedIcon = icon(CancelCircleIcon, "TestFailedIcon")

export const FetchWarningIcon = icon(Alert02Icon, "FetchWarningIcon")
export const RetryIcon = icon(RefreshIcon, "RetryIcon")

export const LoadFailedIcon = icon(CloudOffIcon, "LoadFailedIcon")
