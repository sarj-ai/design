"use client"

import {
  Alert02Icon,
  ArrowDataTransferVerticalIcon,
  ArrowDown01Icon,
  ArrowDownLeft01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  BookOpen02Icon,
  BubbleChatIcon,
  Calendar03Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Coins01Icon,
  CopyLinkIcon as CopyLinkGlyph,
  CpuIcon,
  Delete02Icon,
  Download01Icon,
  PencilEdit02Icon,
  FilterIcon,
  InformationCircleIcon,
  MoreHorizontalIcon,
  PlayIcon,
  RefreshIcon,
  Search01Icon,
  SearchRemoveIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/* The icon rule's example: ordinary actions, because the point of that card is
   one size and one stroke weight rather than the glyphs themselves. */
export const PreviewIcon = icon(PlayIcon, "PreviewIcon")
export const NarrowIcon = icon(FilterIcon, "NarrowIcon")
export const ExportIcon = icon(Download01Icon, "ExportIcon")
export const DeleteIcon = icon(Delete02Icon, "DeleteIcon")

/** The two a row carries. Named for the row, not for the glyph. */
export const EditRowIcon = icon(PencilEdit02Icon, "EditRowIcon")

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

/* The rail's disclosure chevron. It points down when the section is open and
   is rotated a quarter turn when it is not, so one glyph carries both states
   rather than two glyphs that have to be told apart. */
export const SectionToggleIcon = icon(ArrowDown01Icon, "SectionToggleIcon")

/* The tabs demo. One glyph per view of the same call, each naming what that
   view holds — the bar is the thing being demonstrated, so the labels carry
   an icon the way a real settings or record bar does. */
export const TranscriptIcon = icon(BubbleChatIcon, "TranscriptIcon")
export const ModelIcon = icon(CpuIcon, "ModelIcon")
export const CostIcon = icon(Coins01Icon, "CostIcon")

/* The header control that hands this exact topic to someone. The tick is the
   same glyph a finished step uses — one "done" mark across the reference,
   rather than a second one that has to be learned. */
export const CopyLinkIcon = icon(CopyLinkGlyph, "CopyLinkIcon")
export const CopiedIcon = icon(Tick02Icon, "CopiedIcon")

/* The three states that are not the populated one, each named for the state
   rather than the glyph: nothing here yet, nothing matched, and it broke. */
export const NoResultsIcon = icon(SearchRemoveIcon, "NoResultsIcon")
export const SourceIcon = icon(BookOpen02Icon, "SourceIcon")
export const RetryIcon = icon(RefreshIcon, "RetryIcon")
