"use client"

import {
  ArrowDown01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  PlayIcon,
  PlusSignIcon,
  Robot01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* The editor's header: try the scenario, and its overflow menu. */
export const RunScenarioIcon = icon(PlayIcon, "RunScenarioIcon")
export const ScenarioMenuIcon = icon(MoreHorizontalIcon, "ScenarioMenuIcon")

/* The status menu header: the button that opens the Live popover. */
export const StatusMenuIcon = icon(ArrowDown01Icon, "StatusMenuIcon")

/* The save review drawer's close button. */
export const CloseReviewIcon = icon(Cancel01Icon, "CloseReviewIcon")

/* The scenarios index: its two views, search, and the page's buttons. */
export const ActiveViewIcon = icon(CheckmarkCircle02Icon, "ActiveViewIcon")
export const DeletedViewIcon = icon(Delete02Icon, "DeletedViewIcon")
export const SearchScenariosIcon = icon(Search01Icon, "SearchScenariosIcon")
export const OpenPlaygroundIcon = icon(Robot01Icon, "OpenPlaygroundIcon")
export const CreateScenarioIcon = icon(PlusSignIcon, "CreateScenarioIcon")
export const RowActionsIcon = icon(MoreHorizontalIcon, "RowActionsIcon")
