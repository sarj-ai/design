"use client"

import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  BookOpen01Icon,
  Cancel01Icon,
  Copy01Icon,
  Link04Icon,
  Search01Icon,
  SourceCodeIcon,
  Tick02Icon,
  TranslateIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/**
 * Icons for the workspace itself — the index and the shell around every
 * mockup. Icons *inside* a mockup live in that mockup's own icons.tsx; this
 * file is only the chrome.
 */
export const BackIcon = icon(ArrowLeft02Icon, "BackIcon")
export const OpenIcon = icon(ArrowRight02Icon, "OpenIcon")
export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const ClearIcon = icon(Cancel01Icon, "ClearIcon")
export const DirectionIcon = icon(TranslateIcon, "DirectionIcon")

/* Beside the ticket ID in a card's footer, so it reads as something that
   leaves the page rather than as another in-page action. */
export const TicketLinkIcon = icon(ArrowUpRight01Icon, "TicketLinkIcon")

/* On the dock at the foot of the index, pointing at the list of surfaces
   that opens above it. */
export const DockIcon = icon(ArrowUp01Icon, "DockIcon")

/* The registry menu on an index card: the trigger, and the copy affordance
   that swaps to a tick once the command is on the clipboard. */
export const RegistryIcon = icon(SourceCodeIcon, "RegistryIcon")
export const CopyIcon = icon(Copy01Icon, "CopyIcon")
export const CopiedIcon = icon(Tick02Icon, "CopiedIcon")

/* On the index header, next to the search field — the way into the design
   system, which has no card in the list below. */
export const RulesIcon = icon(BookOpen01Icon, "RulesIcon")

/* Opens the card's links — the mockup's own URL and the tickets it answers —
   for copying rather than for following. */
export const ShareLinkIcon = icon(Link04Icon, "ShareLinkIcon")
