import {
  Add01Icon,
  Calendar03Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Download04Icon,
  MoreHorizontalIcon,
  PauseCircleIcon,
  PauseIcon,
  PlayIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";

import { icon } from "@/components/shared/icon";

export const PauseBatchIcon = icon(PauseIcon, "PauseBatchIcon");
export const ResumeBatchIcon = icon(PlayIcon, "ResumeBatchIcon");
export const CancelBatchIcon = icon(CancelCircleIcon, "CancelBatchIcon");
export const RowMenuIcon = icon(MoreHorizontalIcon, "RowMenuIcon");
export const ExportIcon = icon(Download04Icon, "ExportIcon");
export const SettingsIcon = icon(Settings02Icon, "SettingsIcon");
export const NewBatchIcon = icon(Add01Icon, "NewBatchIcon");

export const DoneStatusIcon = icon(CheckmarkCircle02Icon, "DoneStatusIcon");
export const RunningStatusIcon = icon(Clock01Icon, "RunningStatusIcon");
export const QueuedStatusIcon = icon(Calendar03Icon, "QueuedStatusIcon");
export const PausedStatusIcon = icon(PauseCircleIcon, "PausedStatusIcon");
export const CancelledStatusIcon = icon(
  CancelCircleIcon,
  "CancelledStatusIcon",
);
