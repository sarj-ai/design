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

export const AgentIcon = icon(BotIcon, "AgentIcon")

export const ToolIcon = icon(Wrench01Icon, "ToolIcon")
export const ToolCompletedIcon = icon(
  CheckmarkCircle02Icon,
  "ToolCompletedIcon",
)
export const ToolFailedIcon = icon(CancelCircleIcon, "ToolFailedIcon")

export const ExpandIcon = icon(ArrowDown01Icon, "ExpandIcon")

export const CopyIcon = icon(Copy01Icon, "CopyIcon")
export const CopiedIcon = icon(Tick02Icon, "CopiedIcon")
