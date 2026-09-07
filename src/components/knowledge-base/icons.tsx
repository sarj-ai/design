"use client"

import {
  Alert02Icon,
  ArrowDown01Icon,
  AudioWave01Icon,
  BookBookmark01Icon,
  Building02Icon,
  CallOutgoing01Icon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  Database01Icon,
  DashboardSquare01Icon,
  Delete02Icon,
  Download01Icon,
  File01Icon,
  FileUploadIcon,
  Flag02Icon,
  Key01Icon,
  Layout01Icon,
  Link02Icon,
  Loading03Icon,
  Message01Icon,
  Message02Icon,
  MoreHorizontalIcon,
  PlayIcon,
  PlugSocketIcon,
  Search01Icon,
  Settings01Icon,
  SidebarLeft01Icon,
  SmartPhone01Icon,
  SourceCodeIcon,
  TextFontIcon,
  UserMultipleIcon,
  VariableIcon,
  WebhookIcon,
  WirelessIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/* Adding to a knowledge base — the three things V1 can read. */
export const AddFilesIcon = icon(FileUploadIcon, "AddFilesIcon")
export const AddUrlIcon = icon(Link02Icon, "AddUrlIcon")
export const AddTextIcon = icon(TextFontIcon, "AddTextIcon")

/* A document's state after extraction has run, or not yet. */
export const ReadyIcon = icon(CheckmarkCircle02Icon, "ReadyIcon")
export const ExtractingIcon = icon(Loading03Icon, "ExtractingIcon")
export const FailedIcon = icon(Alert02Icon, "FailedIcon")

/* Row and toolbar actions. */
export const DocumentIcon = icon(File01Icon, "DocumentIcon")
export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const RemoveIcon = icon(Delete02Icon, "RemoveIcon")
export const DownloadIcon = icon(Download01Icon, "DownloadIcon")
export const RowMenuIcon = icon(MoreHorizontalIcon, "RowMenuIcon")
export const KnowledgeIcon = icon(BookBookmark01Icon, "KnowledgeIcon")

/* App shell. */
export const AudioIcon = icon(AudioWave01Icon, "AudioIcon")
export const BuildingIcon = icon(Building02Icon, "BuildingIcon")
export const CallOutgoingIcon = icon(CallOutgoing01Icon, "CallOutgoingIcon")
export const ChecklistIcon = icon(CheckListIcon, "ChecklistIcon")
export const ChevronDownIcon = icon(ArrowDown01Icon, "ChevronDownIcon")
export const CodeIcon = icon(SourceCodeIcon, "CodeIcon")
export const DashboardIcon = icon(DashboardSquare01Icon, "DashboardIcon")
export const DatabaseIcon = icon(Database01Icon, "DatabaseIcon")
export const FileIcon = icon(File01Icon, "FileIcon")
export const FlagIcon = icon(Flag02Icon, "FlagIcon")
export const FlowIcon = icon(WorkflowSquare01Icon, "FlowIcon")
export const KeyIcon = icon(Key01Icon, "KeyIcon")
export const MessageIcon = icon(Message01Icon, "MessageIcon")
export const MessagesIcon = icon(Message02Icon, "MessagesIcon")
export const MobileIcon = icon(SmartPhone01Icon, "MobileIcon")
export const PhoneCallIcon = icon(CallOutgoing01Icon, "PhoneCallIcon")
export const PlaybackIcon = icon(PlayIcon, "PlaybackIcon")
export const PlugIcon = icon(PlugSocketIcon, "PlugIcon")
export const SettingsIcon = icon(Settings01Icon, "SettingsIcon")
export const SidebarIcon = icon(SidebarLeft01Icon, "SidebarIcon")
export const TelephonyIcon = icon(WirelessIcon, "TelephonyIcon")
export const TemplateIcon = icon(Layout01Icon, "TemplateIcon")
export const UsersIcon = icon(UserMultipleIcon, "UsersIcon")
export const VariablesIcon = icon(VariableIcon, "VariablesIcon")
export const WebhooksIcon = icon(WebhookIcon, "WebhooksIcon")
