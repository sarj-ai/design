"use client"

import {
  ArrowDown01Icon,
  BlockGameIcon,
  BookOpen02Icon,
  BubbleChatIcon,
  Building02Icon,
  CallRinging04Icon,
  Chart03Icon,
  ChartColumnIcon,
  CodeIcon,
  DashboardBrowsingIcon,
  DashboardCircleIcon,
  Globe02Icon,
  GoogleDocIcon,
  Key01Icon,
  Message02Icon,
  PlayIcon,
  PlusSignIcon,
  Queue02Icon,
  RoboticIcon,
  Settings01Icon,
  ShieldKeyIcon,
  SmartPhone01Icon,
  CpuIcon,
  TaskDaily01Icon,
  TelephoneIcon,
  VariableIcon,
  VoiceIcon,
  WebhookIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/**
 * Icons for the shared product shell — one glyph per nav destination, matched
 * to the app's own sidebar. Icons *inside* a mockup live in that mockup's own
 * icons.tsx; this file is only the app chrome.
 */
export const PlaygroundIcon = icon(PlayIcon, "PlaygroundIcon")
export const PersonasIcon = icon(RoboticIcon, "PersonasIcon")
export const ScenariosIcon = icon(GoogleDocIcon, "ScenariosIcon")
export const KnowledgeIcon = icon(BookOpen02Icon, "KnowledgeIcon")
export const BatchCallsIcon = icon(Queue02Icon, "BatchCallsIcon")
export const TemplateIcon = icon(DashboardCircleIcon, "TemplateIcon")
export const GlobalPromptsIcon = icon(Globe02Icon, "GlobalPromptsIcon")
export const VoiceLibraryIcon = icon(VoiceIcon, "VoiceLibraryIcon")
export const DashboardIcon = icon(Chart03Icon, "DashboardIcon")
export const ConversationsIcon = icon(CallRinging04Icon, "ConversationsIcon")
export const MessagingIcon = icon(Message02Icon, "MessagingIcon")
export const QualityIcon = icon(DashboardBrowsingIcon, "QualityIcon")
export const ReportsIcon = icon(ChartColumnIcon, "ReportsIcon")
export const TasksIcon = icon(TaskDaily01Icon, "TasksIcon")
export const KeyIcon = icon(Key01Icon, "KeyIcon")
export const VariablesIcon = icon(VariableIcon, "VariablesIcon")
export const WebhooksIcon = icon(WebhookIcon, "WebhooksIcon")
export const IntegrationsIcon = icon(BlockGameIcon, "IntegrationsIcon")
export const DeveloperDocsIcon = icon(CodeIcon, "DeveloperDocsIcon")
export const BuildingIcon = icon(Building02Icon, "BuildingIcon")
export const RolesIcon = icon(ShieldKeyIcon, "RolesIcon")
export const MobileIcon = icon(SmartPhone01Icon, "MobileIcon")
/* The model catalog (DES-169), under Configuration. */
export const ModelsIcon = icon(CpuIcon, "ModelsIcon")
export const TelephonyIcon = icon(TelephoneIcon, "TelephonyIcon")
export const SettingsIcon = icon(Settings01Icon, "SettingsIcon")
export const MessagingSettingsIcon = icon(
  BubbleChatIcon,
  "MessagingSettingsIcon",
)
export const ChevronDownIcon = icon(ArrowDown01Icon, "ChevronDownIcon")
/** The hover "+" on Personas and Scenarios — creates one without leaving the nav. */
export const NewItemIcon = icon(PlusSignIcon, "NewItemIcon")
