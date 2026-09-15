"use client"

import {
  Cancel01Icon,
  Delete02Icon,
  Edit03Icon,
  PlayIcon,
  Search01Icon,
  Settings02Icon,
  StopIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* Dialog header. */
export const RenameIcon = icon(Edit03Icon, "RenameIcon")
export const CloseIcon = icon(Cancel01Icon, "CloseIcon")

/* Behavior toggles — the gear opens that behavior's own settings. */
export const BehaviorSettingsIcon = icon(Settings02Icon, "BehaviorSettingsIcon")

/* Pronunciation terms. */
export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const BulkUploadIcon = icon(Upload04Icon, "BulkUploadIcon")
export const HearIcon = icon(PlayIcon, "HearIcon")
export const StopHearingIcon = icon(StopIcon, "StopHearingIcon")
export const DeleteTermIcon = icon(Delete02Icon, "DeleteTermIcon")
