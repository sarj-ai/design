"use client";

import {
  FullScreenIcon,
  MinimizeScreenIcon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
  VolumeHighIcon,
  VolumeMute02Icon,
} from "@hugeicons/core-free-icons";

import { icon } from "@/components/shared/icon";

export const PlayReelIcon = icon(PlayIcon, "PlayReelIcon");
export const PauseReelIcon = icon(PauseIcon, "PauseReelIcon");
export const RestartIcon = icon(RefreshIcon, "RestartIcon");
export const SoundOnIcon = icon(VolumeHighIcon, "SoundOnIcon");
export const SoundOffIcon = icon(VolumeMute02Icon, "SoundOffIcon");
export const EnterFullscreenIcon = icon(FullScreenIcon, "EnterFullscreenIcon");
export const ExitFullscreenIcon = icon(
  MinimizeScreenIcon,
  "ExitFullscreenIcon",
);
