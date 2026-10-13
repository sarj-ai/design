"use client"

import {
  ArrowDown01Icon,
  ArrowLeft02Icon,
  Cancel01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  PlayIcon,
  WorkHistoryIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* The editor's header, as DES-203 left it: try it, and its overflow menu. */
export const RunScenarioIcon = icon(PlayIcon, "RunScenarioIcon")
export const MoreActionsIcon = icon(MoreHorizontalIcon, "MoreActionsIcon")
/** Opens the Live popover. */
export const StatusMenuIcon = icon(ArrowDown01Icon, "StatusMenuIcon")

/** Opens version history. */
export const HistoryIcon = icon(WorkHistoryIcon, "HistoryIcon")
/** Loads an earlier version into the editor as the starting point. */
export const EditFromIcon = icon(PencilEdit02Icon, "EditFromIcon")
/** Leaves "editing from an earlier version" and goes back to the newest. */
export const BackToNewestIcon = icon(ArrowLeft02Icon, "BackToNewestIcon")
/** Opens a version in the Playground without publishing it. */
export const TestVersionIcon = icon(PlayIcon, "TestVersionIcon")
/** Closes a drawer. */
export const CloseIcon = icon(Cancel01Icon, "CloseIcon")
