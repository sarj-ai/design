"use client"

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CheckmarkBadge01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/** The Approvals page, in the nav. */
export const ApprovalsIcon = icon(CheckmarkBadge01Icon, "ApprovalsIcon")
/** Steps to the request above or below in the list. */
export const PreviousRequestIcon = icon(ArrowUp01Icon, "PreviousRequestIcon")
export const NextRequestIcon = icon(ArrowDown01Icon, "NextRequestIcon")
/** Searches requests by scenario. */
export const SearchRequestsIcon = icon(Search01Icon, "SearchRequestsIcon")
/** Closes a drawer. */
export const CloseIcon = icon(Cancel01Icon, "CloseIcon")
