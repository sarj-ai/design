"use client"

import {
  Alert02Icon,
  AudioWave01Icon,
  Brain01Icon,
  CheckmarkCircle02Icon,
  Exchange01Icon,
  HourglassIcon,
  HourglassOffIcon,
  InformationCircleIcon,
  Mic01Icon,
  VolumeHighIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/* The four sections of the Model Settings tab, told apart by their glyph. */
export const LanguageModelIcon = icon(Brain01Icon, "LanguageModelIcon")
export const SpeechToTextIcon = icon(Mic01Icon, "SpeechToTextIcon")
export const TextToSpeechIcon = icon(VolumeHighIcon, "TextToSpeechIcon")
export const TurnDetectionIcon = icon(HourglassIcon, "TurnDetectionIcon")

/* The detection path that ran, and the case where it was not the configured one. */
export const DetectionPathIcon = icon(AudioWave01Icon, "DetectionPathIcon")
export const FellBackIcon = icon(Exchange01Icon, "FellBackIcon")

/* Whether the wait behaved: every turn inside the window, or some at the ceiling. */
export const WithinWindowIcon = icon(CheckmarkCircle02Icon, "WithinWindowIcon")
export const ReachedMaximumIcon = icon(Alert02Icon, "ReachedMaximumIcon")

/* A call from before turn timing was recorded has nothing to read. */
export const NotRecordedIcon = icon(HourglassOffIcon, "NotRecordedIcon")

/**
 * What a reading means, on hover rather than printed under it.
 *
 * The circled "i", matching the platform's own hover-help at
 * `components/scenario/tools/form-components/tooltip-help.tsx`.
 */
export const FieldHelpIcon = icon(InformationCircleIcon, "FieldHelpIcon")
