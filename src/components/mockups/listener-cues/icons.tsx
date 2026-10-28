"use client"

import {
  Alert02Icon,
  ArrowDown01Icon,
  AudioWave01Icon,
  Cancel01Icon,
  Delete02Icon,
  Message01Icon,
  PlayIcon,
  PlusSignIcon,
  Settings01Icon,
  Tick02Icon,
  UserSharingIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* The two backchannel capabilities, kept visually distinct because they run at
   different points in the turn. */
export const FillerWordsIcon = icon(Message01Icon, "FillerWordsIcon")
export const ListenerCuesIcon = icon(AudioWave01Icon, "ListenerCuesIcon")

export const ConfigureIcon = icon(Settings01Icon, "ConfigureIcon")

/* Cue mix row controls — every saved clip can be previewed before saving. */
export const PreviewCueIcon = icon(PlayIcon, "PreviewCueIcon")
export const AddCueIcon = icon(PlusSignIcon, "AddCueIcon")
export const RemoveCueIcon = icon(Delete02Icon, "RemoveCueIcon")

/* The approved-set picker: a chevron so the button reads as "opens a list" and
   not as "type a new cue", and the tick that marks a clip already in the mix. */
export const PickerChevronIcon = icon(ArrowDown01Icon, "PickerChevronIcon")
export const InMixIcon = icon(Tick02Icon, "InMixIcon")

/* The inherit-then-override lifecycle. */
export const OverrideIcon = icon(UserSharingIcon, "OverrideIcon")

export const NoClipsIcon = icon(Alert02Icon, "NoClipsIcon")

/* The frequency guidance, and the same button once the value has left the
   recommended range — a different glyph, not only a different colour. */

export const CloseIcon = icon(Cancel01Icon, "CloseIcon")
