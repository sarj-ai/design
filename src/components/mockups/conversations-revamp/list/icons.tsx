"use client"

import {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowDownLeft01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  CallOutgoing01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  DragDropVerticalIcon,
  FileDownloadIcon,
  FilterHorizontalIcon,
  HelpCircleIcon,
  Loading03Icon,
  PreferenceVerticalIcon,
  RefreshIcon as RefreshSource,
  Search01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Tick02Icon,
  VoiceIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* The filter bar above the table. */
export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const CalendarIcon = icon(Calendar03Icon, "CalendarIcon")
export const RefreshIcon = icon(RefreshSource, "RefreshIcon")
export const MoreFiltersIcon = icon(FilterHorizontalIcon, "MoreFiltersIcon")
export const ChevronDownIcon = icon(ArrowDown01Icon, "ChevronDownIcon")
export const ExportIcon = icon(FileDownloadIcon, "ExportIcon")

/* Table cells. */
export const TimeIcon = icon(Clock01Icon, "TimeIcon")
export const InboundIcon = icon(ArrowDownLeft01Icon, "InboundIcon")
export const OutboundIcon = icon(ArrowUpRight01Icon, "OutboundIcon")

export const ColumnHelpIcon = icon(HelpCircleIcon, "ColumnHelpIcon")
export const SelectedIcon = icon(Tick02Icon, "SelectedIcon")

/* Choosing which columns the table shows, and dragging them into order. */
export const FieldsIcon = icon(PreferenceVerticalIcon, "FieldsIcon")
export const DragHandleIcon = icon(DragDropVerticalIcon, "DragHandleIcon")

/* Call status, and the outcome a report gives it. */
export const CompletedIcon = icon(CheckmarkCircle02Icon, "CompletedIcon")
export const RunningIcon = icon(Loading03Icon, "RunningIcon")
export const NoticeIcon = icon(Alert02Icon, "NoticeIcon")
export const CallOutgoingIcon = icon(CallOutgoing01Icon, "CallOutgoingIcon")
export const NotAnsweredIcon = icon(CancelCircleIcon, "NotAnsweredIcon")
export const VoicemailIcon = icon(VoiceIcon, "VoicemailIcon")
export const FailureIcon = icon(CancelCircleIcon, "FailureIcon")

/* Agent outcome. A separate pair from the tick and cross above, because the
   two verdict columns sit side by side and a row of four identical glyphs
   stops telling the reader which column they are reading. */
export const HelpfulIcon = icon(ThumbsUpIcon, "HelpfulIcon")
export const NotHelpfulIcon = icon(ThumbsDownIcon, "NotHelpfulIcon")


/* Pagination. */
export const PreviousIcon = icon(ArrowLeft01Icon, "PreviousIcon")
export const NextIcon = icon(ArrowRight01Icon, "NextIcon")

