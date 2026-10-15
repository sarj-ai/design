"use client"

import {
  ArrowDown01Icon,
  BotIcon,
  CancelCircleIcon,
  HeadsetIcon,
  UserIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* Who is speaking — the same three glyphs the call page uses today. */
export const AgentIcon = icon(BotIcon, "AgentIcon")
export const CallerIcon = icon(UserIcon, "CallerIcon")
export const HumanAgentIcon = icon(HeadsetIcon, "HumanAgentIcon")

/* A tool row: a tool ran, or a tool failed. There is no success glyph. */
export const ToolIcon = icon(Wrench01Icon, "ToolIcon")
export const ToolFailedIcon = icon(CancelCircleIcon, "ToolFailedIcon")

export const ExpandIcon = icon(ArrowDown01Icon, "ExpandIcon")
