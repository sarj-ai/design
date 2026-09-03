"use client"

import {
  Alert02Icon,
  AudioWave01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
  PlayIcon,
  Refresh01Icon,
  Search01Icon,
  StarIcon,
  StopIcon,
  Target02Icon,
  UserAdd01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/* Index toolbar and rows. */
export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const AddPersonaIcon = icon(UserAdd01Icon, "AddPersonaIcon")
export const EditIcon = icon(Edit02Icon, "EditIcon")
export const DeleteIcon = icon(Delete02Icon, "DeleteIcon")
export const RowMenuIcon = icon(MoreHorizontalIcon, "RowMenuIcon")
export const MakeDefaultIcon = icon(StarIcon, "MakeDefaultIcon")
export const ScenariosIcon = icon(Target02Icon, "ScenariosIcon")

/* Voice previews, everywhere a voice can be heard. */
export const PlayPreviewIcon = icon(PlayIcon, "PlayPreviewIcon")
export const StopPreviewIcon = icon(StopIcon, "StopPreviewIcon")
export const VoiceWaveIcon = icon(AudioWave01Icon, "VoiceWaveIcon")
export const SelectedVoiceIcon = icon(
  CheckmarkCircle02Icon,
  "SelectedVoiceIcon",
)

/* Edge states. */
export const LoadErrorIcon = icon(Alert02Icon, "LoadErrorIcon")
export const RetryIcon = icon(Refresh01Icon, "RetryIcon")
export const NoPersonasIcon = icon(UserMultipleIcon, "NoPersonasIcon")
