"use client"

import {
  Alert02Icon,
  Cancel01Icon,
  Delete02Icon,
  ArrowRight01Icon,
  Message01Icon,
  PlayIcon,
  PlusSignIcon,
  Settings01Icon,
  StopIcon,
  UserSharingIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/* The capability this drawer configures, and the button that opens it. */
export const FillerWordsIcon = icon(Message01Icon, "FillerWordsIcon")
export const ConfigureIcon = icon(Settings01Icon, "ConfigureIcon")

/* Mapping list actions. */
export const AddMappingIcon = icon(PlusSignIcon, "AddMappingIcon")
export const DeleteMappingIcon = icon(Delete02Icon, "DeleteMappingIcon")

/* Hearing a response before it ships. Tashkeel only pays off if the voice
   actually reads it, and no two speech providers read it the same way. */
export const PlayPreviewIcon = icon(PlayIcon, "PlayPreviewIcon")
export const StopPreviewIcon = icon(StopIcon, "StopPreviewIcon")

/* The × on a trigger chip — the whole chip is the remove target. */
export const RemoveTriggerIcon = icon(Cancel01Icon, "RemoveTriggerIcon")

/* Two active rules claiming one phrase, which blocks publishing. */
export const ConflictIcon = icon(Alert02Icon, "ConflictIcon")

/* Caller phrase on one side, agent response on the other, in the collapsed
   row. Mirrored under RTL so it still points from phrase to response. */
export const RespondsWithIcon = icon(ArrowRight01Icon, "RespondsWithIcon")

/* The inherit-then-override lifecycle. */
export const OverrideIcon = icon(UserSharingIcon, "OverrideIcon")

export const CloseIcon = icon(Cancel01Icon, "CloseIcon")
