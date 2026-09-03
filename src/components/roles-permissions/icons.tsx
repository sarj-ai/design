"use client"

import {
  Edit02Icon,
  PlusSignIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/**
 * Icons for the roles matrix — DES-170. Named for the job they do in this
 * grid, not for the glyph, so a reader of the JSX knows what a cell means
 * without looking at the render.
 */

/** A permission this role holds. The only mark in the grid; absence is a dash. */
export const AllowedIcon = icon(Tick02Icon, "AllowedIcon")

export const CreateRoleIcon = icon(PlusSignIcon, "CreateRoleIcon")

export const EditPermissionsIcon = icon(Edit02Icon, "EditPermissionsIcon")
