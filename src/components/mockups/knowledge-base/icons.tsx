"use client"

import {
  Alert02Icon,
  BookBookmark01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Download01Icon,
  FileUploadIcon,
  FolderAddIcon,
  Link02Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/* Adding to a knowledge base — the three things V1 can read. */
export const AddFilesIcon = icon(FileUploadIcon, "AddFilesIcon")
export const AddUrlIcon = icon(Link02Icon, "AddUrlIcon")
export const AddTextIcon = icon(TextFontIcon, "AddTextIcon")
export const NewKnowledgeBaseIcon = icon(FolderAddIcon, "NewKnowledgeBaseIcon")

/* A document's state after extraction has run, or not yet. */
export const ReadyIcon = icon(CheckmarkCircle02Icon, "ReadyIcon")
export const FailedIcon = icon(Alert02Icon, "FailedIcon")

export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const AddFilterIcon = icon(PlusSignIcon, "AddFilterIcon")
export const SortIcon = icon(TextFontIcon, "SortIcon")
export const RemoveIcon = icon(Delete02Icon, "RemoveIcon")
export const DownloadIcon = icon(Download01Icon, "DownloadIcon")
export const RowMenuIcon = icon(MoreHorizontalIcon, "RowMenuIcon")
export const KnowledgeIcon = icon(BookBookmark01Icon, "KnowledgeIcon")

