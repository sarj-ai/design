"use client"

import {
  ArrowUpRight01Icon,
  BookOpen02Icon,
  Copy01Icon,
  Delete02Icon,
  Key01Icon,
  McpServerIcon,
  PlusSignIcon,
  Tick02Icon,
  ViewIcon,
  ViewOffIcon,
  WebhookIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* The code block's copy control, and the tick it swaps to. */
export const CopyCodeIcon = icon(Copy01Icon, "CopyCodeIcon")
export const CopiedIcon = icon(Tick02Icon, "CopiedIcon")

/* A link that leaves the platform for the docs site. */
export const ExternalIcon = icon(ArrowUpRight01Icon, "ExternalIcon")

/* Quick links. */
export const ApiKeyIcon = icon(Key01Icon, "ApiKeyIcon")
export const ApiReferenceIcon = icon(BookOpen02Icon, "ApiReferenceIcon")
export const WebhookLinkIcon = icon(WebhookIcon, "WebhookLinkIcon")
export const McpIcon = icon(McpServerIcon, "McpIcon")

/* Tab actions. */
export const CreateIcon = icon(PlusSignIcon, "CreateIcon")
export const DeleteKeyIcon = icon(Delete02Icon, "DeleteKeyIcon")
export const RevealIcon = icon(ViewIcon, "RevealIcon")
export const HideIcon = icon(ViewOffIcon, "HideIcon")
