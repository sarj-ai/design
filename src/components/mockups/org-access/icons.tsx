"use client"

import {
  Copy01Icon,
  Link04Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* The members list: invite someone, or open the shareable link. */
export const InviteMemberIcon = icon(UserAdd01Icon, "InviteMemberIcon")
export const InviteLinkIcon = icon(Link04Icon, "InviteLinkIcon")
export const CopyLinkIcon = icon(Copy01Icon, "CopyLinkIcon")

/* A row's actions. */
export const RowActionsIcon = icon(MoreHorizontalIcon, "RowActionsIcon")

/* The search that narrows a list. */
export const SearchListIcon = icon(Search01Icon, "SearchListIcon")

/* Sarj's organizations list: make a new one. */
export const CreateOrganizationIcon = icon(
  PlusSignIcon,
  "CreateOrganizationIcon",
)
