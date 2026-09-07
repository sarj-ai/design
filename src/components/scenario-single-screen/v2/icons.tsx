import {
  Alert02Icon,
  ArrowRight01Icon,
  Building01Icon,
  Cancel01Icon,
  ChartLineData01Icon,
  CheckmarkCircle02Icon,
  DatabaseIcon,
  Delete02Icon,
  DragDropVerticalIcon,
  DialpadCircle01Icon,
  Globe02Icon,
  Idea01Icon,
  LanguageSkillIcon,
  Mic01Icon,
  PlayIcon,
  PlugSocketIcon,
  PlusSignIcon,
  RocketIcon,
  Route01Icon,
  Search01Icon,
  SourceCodeIcon,
  ShoppingBag01Icon,
  Target02Icon,
  TicketStarIcon,
  Timer01Icon,
  UserGroupIcon,
  VariableIcon,
  VoiceIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/icon"

/* --- the rail: one glyph per setting, named for the setting ------------- */

/** Which persona speaks this scenario, per language. */
export const PersonaIcon = icon(Mic01Icon, "PersonaIcon")

/** The languages the scenario is configured in. */
export const LanguagesIcon = icon(Globe02Icon, "LanguagesIcon")

/** The timezone the agent reads dates and times against. */
export const TimezoneIcon = icon(Timer01Icon, "TimezoneIcon")

/** Bases the agent can look answers up in. */
export const KnowledgeIcon = icon(DatabaseIcon, "KnowledgeIcon")

/** Actions the agent can take mid-call. */
export const ToolsIcon = icon(Wrench01Icon, "ToolsIcon")

/** What counts as a successful call. */
export const CriteriaIcon = icon(Target02Icon, "CriteriaIcon")

/** Fields pulled out of the conversation when it ends. */
export const ExtractionIcon = icon(PlugSocketIcon, "ExtractionIcon")

/** Where the call recording is delivered. */
export const RecordingIcon = icon(VoiceIcon, "RecordingIcon")

/** Placeholders the prompt fills in at call time. */
export const VariablesIcon = icon(VariableIcon, "VariablesIcon")

/** What the calls are telling you about this scenario. */
export const InsightsIcon = icon(Idea01Icon, "InsightsIcon")

/** Savings and cleanups only Sarj staff can act on. */
export const OpportunitiesIcon = icon(ChartLineData01Icon, "OpportunitiesIcon")

/** Moving the scenario to another organization. */
export const OwnershipIcon = icon(Building01Icon, "OwnershipIcon")

/* --- affordances -------------------------------------------------------- */

/** A rail row opens its drawer. */
export const OpenSettingIcon = icon(ArrowRight01Icon, "OpenSettingIcon")

/** Try the scenario before publishing it. */
export const TestCallIcon = icon(PlayIcon, "TestCallIcon")

/** Push the saved scenario live. */
export const PublishIcon = icon(RocketIcon, "PublishIcon")

/** Add a criterion, a variable, a language. */
export const AddIcon = icon(PlusSignIcon, "AddIcon")

/** Remove a row from a list inside a drawer. */
export const RemoveIcon = icon(Delete02Icon, "RemoveIcon")

/* The prompt builder: reordering a call step, and the escape hatch to the raw
   markdown the model is actually sent. */
export const DragStepIcon = icon(DragDropVerticalIcon, "DragStepIcon")
export const RawPromptIcon = icon(SourceCodeIcon, "RawPromptIcon")

/** Dismiss an insight without acting on it. */
export const DismissIcon = icon(Cancel01Icon, "DismissIcon")

/** Filter a long list down inside a drawer. */
export const FindIcon = icon(Search01Icon, "FindIcon")

/** Unsaved changes are waiting in the save bar. */
export const UnsavedIcon = icon(Alert02Icon, "UnsavedIcon")

/** A setting that is complete and needs nothing. */
export const ConfiguredIcon = icon(CheckmarkCircle02Icon, "ConfiguredIcon")

/* --- tools, each drawn as what it does on a call ------------------------ */

export const EndCallToolIcon = icon(Cancel01Icon, "EndCallToolIcon")
export const TransferToolIcon = icon(UserGroupIcon, "TransferToolIcon")
export const SwitchLanguageToolIcon = icon(
  LanguageSkillIcon,
  "SwitchLanguageToolIcon",
)
export const VoicemailToolIcon = icon(VoiceIcon, "VoicemailToolIcon")
export const CollectDigitsToolIcon = icon(
  DialpadCircle01Icon,
  "CollectDigitsToolIcon",
)
export const HttpRequestToolIcon = icon(PlugSocketIcon, "HttpRequestToolIcon")
export const IvrToolIcon = icon(Route01Icon, "IvrToolIcon")
export const SallaToolIcon = icon(ShoppingBag01Icon, "SallaToolIcon")
export const ZohoTicketToolIcon = icon(TicketStarIcon, "ZohoTicketToolIcon")
