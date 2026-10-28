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

import { icon } from "@/components/shared/icon"

export const LanguageModelIcon = icon(Brain01Icon, "LanguageModelIcon")
export const SpeechToTextIcon = icon(Mic01Icon, "SpeechToTextIcon")
export const TextToSpeechIcon = icon(VolumeHighIcon, "TextToSpeechIcon")
export const TurnDetectionIcon = icon(HourglassIcon, "TurnDetectionIcon")

export const DetectionPathIcon = icon(AudioWave01Icon, "DetectionPathIcon")
export const FellBackIcon = icon(Exchange01Icon, "FellBackIcon")

export const WithinWindowIcon = icon(CheckmarkCircle02Icon, "WithinWindowIcon")
export const ReachedMaximumIcon = icon(Alert02Icon, "ReachedMaximumIcon")

export const NotRecordedIcon = icon(HourglassOffIcon, "NotRecordedIcon")

export const FieldHelpIcon = icon(InformationCircleIcon, "FieldHelpIcon")
