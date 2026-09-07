"use client"

import {
  Alert02Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/* The route card. Every glyph here is an action — the field labels are text. */
export const ReorderIcon = icon(DragDropVerticalIcon, "ReorderIcon")
export const RemoveCaseIcon = icon(Cancel01Icon, "RemoveCaseIcon")
export const CloseIcon = icon(Cancel01Icon, "CloseIcon")
export const DeleteRouteIcon = icon(Delete02Icon, "DeleteRouteIcon")
export const AddRouteIcon = icon(PlusSignIcon, "AddRouteIcon")
export const SetDefaultIcon = icon(CheckmarkCircle02Icon, "SetDefaultIcon")
export const ExpandIcon = icon(ArrowDown01Icon, "ExpandIcon")

/* The overlap warning. */
export const OverlapIcon = icon(Alert02Icon, "OverlapIcon")
