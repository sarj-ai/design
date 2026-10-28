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

export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const RefreshIcon = icon(RefreshGlyph, "RefreshIcon")
export const ExportIcon = icon(FileDownloadIcon, "ExportIcon")

export const PreviousCallIcon = icon(ArrowUp01Icon, "PreviousCallIcon")
export const NextCallIcon = icon(ArrowDown01Icon, "NextCallIcon")
export const CloseIcon = icon(Cancel01Icon, "CloseIcon")

export const SaveForLaterIcon = icon(Bookmark02Icon, "SaveForLaterIcon")

export const ReviewModeIcon = icon(CheckListIcon, "ReviewModeIcon")
export const StartReviewIcon = icon(PlayIcon, "StartReviewIcon")
export const MarkReviewedIcon = icon(Tick02Icon, "MarkReviewedIcon")
