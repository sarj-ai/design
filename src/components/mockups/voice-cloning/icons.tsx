import {
  CheckmarkCircle02Icon,
  Delete02Icon,
  Mic01Icon,
  PauseIcon,
  PencilEdit02Icon,
  PlayIcon,
  PlusSignIcon,
  Search01Icon,
  StopIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/** Opens the clone flow, and starts a take inside it. */
export const RecordIcon = icon(Mic01Icon, "RecordIcon")
/** Ends a take. */
export const StopRecordingIcon = icon(StopIcon, "StopRecordingIcon")
/** Picks a file instead of recording. */
export const UploadSampleIcon = icon(Upload01Icon, "UploadSampleIcon")
/** Plays a take, a preview or a library voice. */
export const PlayVoiceIcon = icon(PlayIcon, "PlayVoiceIcon")
export const PauseVoiceIcon = icon(PauseIcon, "PauseVoiceIcon")
/** Registers an external voice by ID — the existing Add voice. */
export const AddVoiceIcon = icon(PlusSignIcon, "AddVoiceIcon")
export const SearchVoicesIcon = icon(Search01Icon, "SearchVoicesIcon")
export const EditVoiceIcon = icon(PencilEdit02Icon, "EditVoiceIcon")
export const DeleteVoiceIcon = icon(Delete02Icon, "DeleteVoiceIcon")
/** The Active status chip, as the platform's voice table draws it. */
export const ActiveVoiceIcon = icon(CheckmarkCircle02Icon, "ActiveVoiceIcon")
