"use client"

import {
  ArrowDown01Icon,
  BotIcon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Tick02Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* The AI agent — the same glyph the call page uses today. People get an orb. */
export const AgentIcon = icon(BotIcon, "AgentIcon")

/* A tool row: a tool ran and said what happened, finished with nothing to add,
   or failed. */
export const ToolIcon = icon(Wrench01Icon, "ToolIcon")
export const ToolCompletedIcon = icon(
  CheckmarkCircle02Icon,
  "ToolCompletedIcon",
)
export const ToolFailedIcon = icon(CancelCircleIcon, "ToolFailedIcon")

export const ExpandIcon = icon(ArrowDown01Icon, "ExpandIcon")

/* Copying a payload, and the moment after. */
export const CopyIcon = icon(Copy01Icon, "CopyIcon")
export const CopiedIcon = icon(Tick02Icon, "CopiedIcon")
