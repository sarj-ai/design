"use client"

import {
  AiMagicIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  BotIcon,
  Building02Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  Comment01Icon,
  Database01Icon,
  DragDropVerticalIcon,
  Flag02Icon,
  GlobeIcon,
  Idea01Icon,
  NoteIcon,
  PlusSignCircleIcon,
  PreferenceVerticalIcon,
  Search01Icon,
  SidebarRight01Icon,
  BubbleChatIcon,
  Message01Icon,
  PauseIcon as PauseSource,
  PlugSocketIcon,
  UserIcon,
  Wrench01Icon,
  Calendar03Icon,
  CancelCircleIcon,
  Link04Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Copy01Icon,
  DashboardSpeed01Icon,
  Download01Icon,
  HeadsetIcon,
  Link02Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

export const OutboundIcon = icon(ArrowUpRight01Icon, "OutboundIcon")
export const CopyLinkIcon = icon(Link02Icon, "CopyLinkIcon")

/* The recording player. */
export const PlayCallIcon = icon(PlayIcon, "PlayCallIcon")
export const PauseIcon = icon(PauseSource, "PauseIcon")
export const SpeedIcon = icon(DashboardSpeed01Icon, "SpeedIcon")
export const DownloadIcon = icon(Download01Icon, "DownloadIcon")

/* Whoever is speaking, in the transcript. */
export const AgentIcon = icon(BotIcon, "AgentIcon")
export const CallerIcon = icon(UserIcon, "CallerIcon")
export const HumanAgentIcon = icon(HeadsetIcon, "HumanAgentIcon")

/* Status, outcome, and the criteria list. */
export const CompletedIcon = icon(CheckmarkCircle02Icon, "CompletedIcon")
export const FailureIcon = icon(CancelCircleIcon, "FailureIcon")
export const ScheduledIcon = icon(Calendar03Icon, "ScheduledIcon")

/* Copying a data section. */
export const CopyIcon = icon(Copy01Icon, "CopyIcon")

export const CorrectionIcon = icon(AiMagicIcon, "CorrectionIcon")
export const BackchannelIcon = icon(Message01Icon, "BackchannelIcon")
export const ToolIcon = icon(PlugSocketIcon, "ToolIcon")
export const InsightsIcon = icon(Idea01Icon, "InsightsIcon")
export const CollectedIcon = icon(Database01Icon, "CollectedIcon")
export const TechnicalIcon = icon(Wrench01Icon, "TechnicalIcon")
export const LanguageIcon = icon(GlobeIcon, "LanguageIcon")
export const OrganizationIcon = icon(Building02Icon, "OrganizationIcon")
export const OwnerIcon = icon(UserIcon, "OwnerIcon")
export const ChevronDownIcon = icon(ArrowDown01Icon, "ChevronDownIcon")


/* Searching the transcript. */
export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const PrevMatchIcon = icon(ArrowUp01Icon, "PrevMatchIcon")
export const NextMatchIcon = icon(ArrowDown01Icon, "NextMatchIcon")
export const ClearSearchIcon = icon(Cancel01Icon, "ClearSearchIcon")

/* A line the enhanced pass recovered and the live transcription never had. */
export const AddedIcon = icon(PlusSignCircleIcon, "AddedIcon")

/* Flagging a moment in the recording. */
export const FlagIcon = icon(Flag02Icon, "FlagIcon")

/* Reordering and hiding the sections in the panel. */
export const CustomizeIcon = icon(PreferenceVerticalIcon, "CustomizeIcon")
export const DragHandleIcon = icon(DragDropVerticalIcon, "DragHandleIcon")
export const SummaryIcon = icon(NoteIcon, "SummaryIcon")

/* A call that has not run yet: what it is waiting for, and how to stop it. */
export const CalendarIcon = icon(Calendar03Icon, "CalendarIcon")
export const QueuedIcon = icon(Clock01Icon, "QueuedIcon")
export const CancelCallIcon = icon(CancelCircleIcon, "CancelCallIcon")

/* The scheduling relationship: where a booking came from, and the row that
   follows it. */
export const LinkedCallIcon = icon(Link04Icon, "LinkedCallIcon")
export const OpenLinkedCallIcon = icon(ArrowRight02Icon, "OpenLinkedCallIcon")
/* A callback the customer asked for out loud, as against one the analyst
   inferred — which keeps the calendar glyph. */
export const RequestedIcon = icon(Comment01Icon, "RequestedIcon")

/* Bringing back a half of the split that was dragged shut. */
export const ShowPanelIcon = icon(SidebarRight01Icon, "ShowPanelIcon")

/* The header rail on a chat session, where a call prints its number. */
export const ChatChannelIcon = icon(BubbleChatIcon, "ChatChannelIcon")
