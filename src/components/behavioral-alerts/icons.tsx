"use client"

import {
  ArrowDown01Icon,
  ArrowDownLeft01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  BotIcon,
  Building02Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Copy01Icon,
  DashboardSpeed01Icon,
  Database01Icon,
  Delete02Icon,
  Download01Icon,
  DragDropVerticalIcon,
  Flag02Icon,
  Edit02Icon,
  GlobeIcon,
  InformationCircleIcon,
  Link02Icon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  PlusSignIcon,
  PreferenceVerticalIcon,
  QuoteDownIcon,
  Search01Icon,
  Settings01Icon,
  SidebarRight01Icon,
  StarIcon,
  UserIcon,
  UserStar01Icon,
  VoiceIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/**
 * Icons for the behavioural alerts screens, named for the job they do here.
 *
 * The severity of a detection is carried by its badge and its marker, not by an
 * icon per row — three near-identical warning glyphs down a list say less than
 * three words do.
 */

/** The alerts section, and the empty state when nothing has been configured. */
export const FlagsIcon = icon(Flag02Icon, "FlagsIcon")

/** Marks the evidence block as a quotation lifted out of the transcript. */
export const EvidenceIcon = icon(QuoteDownIcon, "EvidenceIcon")

/** One rung of the satisfaction rating. Filled with `fill-current`. */
export const RatingStarIcon = icon(StarIcon, "RatingStarIcon")

/** The caller got what they rang for. */
export const PurposeMetIcon = icon(CheckmarkCircle02Icon, "PurposeMetIcon")

/** The caller did not get what they rang for. */
export const PurposeMissedIcon = icon(Cancel01Icon, "PurposeMissedIcon")

export const RationaleIcon = icon(InformationCircleIcon, "RationaleIcon")

/** Opens the scenario the alerts are configured on. */
export const ScenarioSettingsIcon = icon(Settings01Icon, "ScenarioSettingsIcon")

export const AddAlertIcon = icon(PlusSignIcon, "AddAlertIcon")
export const EditAlertIcon = icon(Edit02Icon, "EditAlertIcon")
export const DeleteAlertIcon = icon(Delete02Icon, "DeleteAlertIcon")
export const RowMenuIcon = icon(MoreHorizontalIcon, "RowMenuIcon")

/* ------------------------------------------- the drawer the alerts live in */

/* The header rail: which way the call went, and who it belongs to. */
export const InboundIcon = icon(ArrowDownLeft01Icon, "InboundIcon")
export const OutboundIcon = icon(ArrowUpRight01Icon, "OutboundIcon")
export const OrganizationIcon = icon(Building02Icon, "OrganizationIcon")
export const OwnerIcon = icon(UserIcon, "OwnerIcon")
export const LanguageIcon = icon(GlobeIcon, "LanguageIcon")
export const CopyCallLinkIcon = icon(Link02Icon, "CopyCallLinkIcon")
export const CopyIdIcon = icon(Copy01Icon, "CopyIdIcon")

/* The call's own status, and the verdict on its success criteria. */
export const CallCompletedIcon = icon(
  CheckmarkCircle02Icon,
  "CallCompletedIcon",
)
export const VoicemailIcon = icon(VoiceIcon, "VoicemailIcon")
export const CriterionMetIcon = icon(CheckmarkCircle02Icon, "CriterionMetIcon")
export const CriterionMissedIcon = icon(CancelCircleIcon, "CriterionMissedIcon")
export const GeneratedAtIcon = icon(Clock01Icon, "GeneratedAtIcon")

/* The recording player. */
export const PlayRecordingIcon = icon(PlayIcon, "PlayRecordingIcon")
export const PauseRecordingIcon = icon(PauseIcon, "PauseRecordingIcon")
export const PlaybackSpeedIcon = icon(DashboardSpeed01Icon, "PlaybackSpeedIcon")
export const DownloadRecordingIcon = icon(
  Download01Icon,
  "DownloadRecordingIcon",
)

/* Whoever is speaking, in the transcript. */
export const AgentIcon = icon(BotIcon, "AgentIcon")
export const CallerIcon = icon(UserIcon, "CallerIcon")

/* Searching the transcript. */
export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const PrevMatchIcon = icon(ArrowUp01Icon, "PrevMatchIcon")
export const NextMatchIcon = icon(ArrowDown01Icon, "NextMatchIcon")
export const ClearSearchIcon = icon(Cancel01Icon, "ClearSearchIcon")

/* The panel of sections beside it: what each one is, and how it is rearranged. */
export const ExperienceIcon = icon(UserStar01Icon, "ExperienceIcon")
export const CollectedIcon = icon(Database01Icon, "CollectedIcon")
export const TechnicalIcon = icon(Wrench01Icon, "TechnicalIcon")
export const SectionToggleIcon = icon(ArrowDown01Icon, "SectionToggleIcon")
export const CustomizeIcon = icon(PreferenceVerticalIcon, "CustomizeIcon")
export const DragHandleIcon = icon(DragDropVerticalIcon, "DragHandleIcon")

/* Bringing back a half of the split that was dragged shut. */
export const ShowPanelIcon = icon(SidebarRight01Icon, "ShowPanelIcon")
