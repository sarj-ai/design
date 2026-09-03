"use client"

import {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowDownLeft01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  AudioWave01Icon,
  BlockGameIcon,
  BookOpen02Icon,
  BotIcon,
  BubbleChatIcon,
  Building02Icon,
  Calendar03Icon,
  CallOutgoing01Icon,
  CallRinging04Icon,
  CancelCircleIcon,
  Chart03Icon,
  ChartColumnIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CodeIcon,
  Copy01Icon,
  DashboardBrowsingIcon,
  DashboardCircleIcon,
  DashboardSpeed01Icon,
  Download01Icon,
  DragDropVerticalIcon,
  File01Icon,
  FileDownloadIcon,
  FilterHorizontalIcon,
  Globe02Icon,
  GoogleDocIcon,
  HeadsetIcon,
  HelpCircleIcon,
  Key01Icon,
  Link02Icon,
  Loading03Icon,
  Message02Icon,
  PauseIcon as PauseSource,
  PlayIcon,
  PlusSignIcon,
  PreferenceVerticalIcon,
  Queue02Icon,
  RefreshIcon as RefreshSource,
  RoboticIcon,
  Search01Icon,
  Settings01Icon,
  SidebarLeft01Icon,
  SmartPhone01Icon,
  TaskDaily01Icon,
  TelephoneIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Tick02Icon,
  UserIcon,
  VariableIcon,
  ViewIcon,
  VoiceIcon,
  WebhookIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/* The filter bar above the table. */
export const SearchIcon = icon(Search01Icon, "SearchIcon")
export const ClearIcon = icon(Cancel01Icon, "ClearIcon")
export const CalendarIcon = icon(Calendar03Icon, "CalendarIcon")
export const ViewsIcon = icon(ViewIcon, "ViewsIcon")
export const RefreshIcon = icon(RefreshSource, "RefreshIcon")
export const MoreFiltersIcon = icon(FilterHorizontalIcon, "MoreFiltersIcon")
export const ChevronDownIcon = icon(ArrowDown01Icon, "ChevronDownIcon")
export const ExportIcon = icon(FileDownloadIcon, "ExportIcon")
export const AdminOrgIcon = icon(Building02Icon, "AdminOrgIcon")

/* Table cells. */
export const TimeIcon = icon(Clock01Icon, "TimeIcon")
export const InboundIcon = icon(ArrowDownLeft01Icon, "InboundIcon")
export const OutboundIcon = icon(ArrowUpRight01Icon, "OutboundIcon")

export const ColumnHelpIcon = icon(HelpCircleIcon, "ColumnHelpIcon")
export const SelectedIcon = icon(Tick02Icon, "SelectedIcon")

/* Choosing which columns the table shows, and dragging them into order. */
export const FieldsIcon = icon(PreferenceVerticalIcon, "FieldsIcon")
export const DragHandleIcon = icon(DragDropVerticalIcon, "DragHandleIcon")

/* Call status, and the outcome a report gives it. */
export const CompletedIcon = icon(CheckmarkCircle02Icon, "CompletedIcon")
export const RunningIcon = icon(Loading03Icon, "RunningIcon")
export const NoticeIcon = icon(Alert02Icon, "NoticeIcon")
export const CallOutgoingIcon = icon(CallOutgoing01Icon, "CallOutgoingIcon")
export const NotAnsweredIcon = icon(CancelCircleIcon, "NotAnsweredIcon")
export const VoicemailIcon = icon(VoiceIcon, "VoicemailIcon")
export const FailureIcon = icon(CancelCircleIcon, "FailureIcon")

/* Agent outcome. A separate pair from the tick and cross above, because the
   two verdict columns sit side by side and a row of four identical glyphs
   stops telling the reader which column they are reading. */
export const HelpfulIcon = icon(ThumbsUpIcon, "HelpfulIcon")
export const NotHelpfulIcon = icon(ThumbsDownIcon, "NotHelpfulIcon")

/* The drawer. */
export const CopyLinkIcon = icon(Link02Icon, "CopyLinkIcon")
export const CopiedIcon = icon(Tick02Icon, "CopiedIcon")
export const CopyIcon = icon(Copy01Icon, "CopyIcon")
export const PlayCallIcon = icon(PlayIcon, "PlayCallIcon")
export const PauseIcon = icon(PauseSource, "PauseIcon")
export const SpeedIcon = icon(DashboardSpeed01Icon, "SpeedIcon")
export const DownloadIcon = icon(Download01Icon, "DownloadIcon")
export const AgentIcon = icon(BotIcon, "AgentIcon")
export const CallerIcon = icon(UserIcon, "CallerIcon")
export const HumanAgentIcon = icon(HeadsetIcon, "HumanAgentIcon")
export const ReportIcon = icon(File01Icon, "ReportIcon")
export const WaveformIcon = icon(AudioWave01Icon, "WaveformIcon")

/* Pagination. */
export const PreviousIcon = icon(ArrowLeft01Icon, "PreviousIcon")
export const NextIcon = icon(ArrowRight01Icon, "NextIcon")

/* App shell — one glyph per nav destination, matched to the app's own sidebar. */
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
export const MobileIcon = icon(SmartPhone01Icon, "MobileIcon")
export const TelephonyIcon = icon(TelephoneIcon, "TelephonyIcon")
export const SettingsIcon = icon(Settings01Icon, "SettingsIcon")
export const MessagingSettingsIcon = icon(
  BubbleChatIcon,
  "MessagingSettingsIcon",
)
export const SidebarIcon = icon(SidebarLeft01Icon, "SidebarIcon")
/** The hover "+" on Personas and Scenarios — creates one without leaving the nav. */
export const NewItemIcon = icon(PlusSignIcon, "NewItemIcon")
