"use client"

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Bookmark02Icon,
  Cancel01Icon,
  CheckListIcon,
  FileDownloadIcon,
  PlayIcon,
  RefreshIcon as RefreshGlyph,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* The page's own row: search, refresh, export. */
export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const RefreshIcon = icon(RefreshGlyph, "RefreshIcon")
export const ExportIcon = icon(FileDownloadIcon, "ExportIcon")

/* The call drawer: step to the call above or below, and close. */
export const PreviousCallIcon = icon(ArrowUp01Icon, "PreviousCallIcon")
export const NextCallIcon = icon(ArrowDown01Icon, "NextCallIcon")
export const CloseIcon = icon(Cancel01Icon, "CloseIcon")

/* Keeping a call for later, on a row and in the drawer. */
export const SaveForLaterIcon = icon(Bookmark02Icon, "SaveForLaterIcon")

/* Review mode's switch, starting a review session, and marking a call. */
export const ReviewModeIcon = icon(CheckListIcon, "ReviewModeIcon")
export const StartReviewIcon = icon(PlayIcon, "StartReviewIcon")
export const MarkReviewedIcon = icon(Tick02Icon, "MarkReviewedIcon")
