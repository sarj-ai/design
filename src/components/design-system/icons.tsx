"use client"

import {
  Alert02Icon,
  ArrowDataTransferVerticalIcon,
  ArrowDown01Icon,
  ArrowDownLeft01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete02Icon,
  Download01Icon,
  FilterIcon,
  InformationCircleIcon,
  MoreHorizontalIcon,
  PlayIcon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/* The icon rule's example: ordinary actions, because the point of that card is
   one size and one stroke weight rather than the glyphs themselves. */
export const PreviewIcon = icon(PlayIcon, "PreviewIcon")
export const NarrowIcon = icon(FilterIcon, "NarrowIcon")
export const ExportIcon = icon(Download01Icon, "ExportIcon")
export const DeleteIcon = icon(Delete02Icon, "DeleteIcon")

/** Sorting: the active direction, and the affordance on a column that is not sorted. */
export const SortAscIcon = icon(ArrowUp01Icon, "SortAscIcon")
export const SortDescIcon = icon(ArrowDown01Icon, "SortDescIcon")
export const SortableIcon = icon(ArrowDataTransferVerticalIcon, "SortableIcon")

/** Direction, which is what tells the two neutral chips apart. */
export const InboundIcon = icon(ArrowDownLeft01Icon, "InboundIcon")
export const OutboundIcon = icon(ArrowUpRight01Icon, "OutboundIcon")

/** The four call states. */
export const CompletedIcon = icon(CheckmarkCircle02Icon, "CompletedIcon")
export const FailedIcon = icon(CancelCircleIcon, "FailedIcon")
export const RunningIcon = icon(Clock01Icon, "RunningIcon")
export const ScheduledIcon = icon(Calendar03Icon, "ScheduledIcon")

/* The close control on the drawer demo's header — the house shape is a title,
   a description and this button, with no icon tile beside the title. */
export const CloseIcon = icon(Cancel01Icon, "CloseIcon")

export const RowMenuIcon = icon(MoreHorizontalIcon, "RowMenuIcon")
export const SearchIcon = icon(Search01Icon, "SearchIcon")

/* The multi-step form explains its fields with an (i) beside the label rather
   than a line under it — the reference it is built from does, and a screen
   uses one language for all of its fields or the other. */
export const HintIcon = icon(InformationCircleIcon, "HintIcon")
export const WarningIcon = icon(Alert02Icon, "WarningIcon")

/** A bare tick, for a step already done. `CompletedIcon` is a circled one and
    would sit inside the stepper's own circle. */
export const StepDoneIcon = icon(Tick02Icon, "StepDoneIcon")
