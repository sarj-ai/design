"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  CriteriaDrawerBody,
  ExtractionDrawerBody,
  KnowledgeDrawerBody,
  LanguagesDrawerBody,
  PersonaDrawerBody,
  RecordingDrawerBody,
  ToolsDrawerBody,
  VariablesDrawerBody,
} from "@/components/scenario-single-screen/v2/config-drawers"
import {
  CriteriaIcon,
  ExtractionIcon,
  InsightsIcon,
  KnowledgeIcon,
  LanguagesIcon,
  OpportunitiesIcon,
  OwnershipIcon,
  PersonaIcon,
  PublishIcon,
  RecordingIcon,
  TestCallIcon,
  TimezoneIcon,
  ToolsIcon,
  UnsavedIcon,
  VariablesIcon,
} from "@/components/scenario-single-screen/v2/icons"
import {
  InsightsDrawerBody,
  OpportunitiesDrawerBody,
  OwnershipDrawerBody,
} from "@/components/scenario-single-screen/v2/review-drawers"
import {
  RailGroup,
  SettingRow,
} from "@/components/scenario-single-screen/v2/setting-rail"
import { SettingSheet } from "@/components/scenario-single-screen/v2/setting-sheet"
import {
  DATA_EXTRACTION,
  DEFAULT_LANGUAGE,
  DESTINATIONS,
  type Destination,
  INSIGHTS,
  type InsightTarget,
  KNOWLEDGE_BASES,
  LANGUAGE_LABELS,
  LANGUAGE_SHORT,
  type LanguageCode,
  OPPORTUNITIES,
  PER_LANGUAGE,
  RECORD_SINKS,
  SCENARIO,
  SUCCESS_CRITERIA,
  TEMPLATE_VARIABLES,
  TIMEZONE,
  TOOLS,
  type ToolSlug,
  UNRESOLVED_INSIGHTS,
} from "@/lib/scenario-single-screen-data"
import {
  IMPLICIT_VARIABLES,
  SECTIONED_PROMPTS,
  type SectionedPrompt,
} from "@/lib/scenario-single-screen-v2-data"
import { PromptBuilder } from "@/components/scenario-single-screen/v2/prompt-builder"
import { RawPromptDrawer } from "@/components/scenario-single-screen/v2/raw-prompt-drawer"

/** Every drawer this screen can open. One at a time, by design. */
type Setting =
  | "criteria"
  | "extraction"
  | "insights"
  | "knowledge"
  | "languages"
  | "opportunities"
  | "ownership"
  | "persona"
  | "recording"
  | "timezone"
  | "tools"
  | "variables"

/** Which drawer an insight's "open" button lands on. */
const INSIGHT_TARGETS: Record<InsightTarget, Setting | null> = {
  criteria: "criteria",
  extraction: "extraction",
  knowledge: "knowledge",
  /* The prompt is on the page, so there is nothing to open — closing the
     drawer already puts the reader in front of it. */
  prompt: null,
  tools: "tools",
}

export function ScenarioEditor({ isStaff }: { isStaff: boolean }) {
  const [openSetting, setOpenSetting] = React.useState<Setting | null>(null)
  const [dirty, setDirty] = React.useState(false)

  const [language, setLanguage] = React.useState<LanguageCode>(DEFAULT_LANGUAGE)
  const [defaultLanguage, setDefaultLanguage] =
    React.useState<LanguageCode>(DEFAULT_LANGUAGE)
  const [perLanguage, setPerLanguage] = React.useState(PER_LANGUAGE)
  const [timezone, setTimezone] = React.useState(TIMEZONE)
  const [bases, setBases] = React.useState(KNOWLEDGE_BASES)
  const [tools, setTools] = React.useState(TOOLS)
  const [criteria, setCriteria] = React.useState(SUCCESS_CRITERIA)
  const [variables, setVariables] = React.useState(TEMPLATE_VARIABLES)
  const [extractionOn, setExtractionOn] = React.useState(
    DATA_EXTRACTION.enabled,
  )
  const [destinations, setDestinations] = React.useState(DESTINATIONS)
  const [zohoRecording, setZohoRecording] = React.useState(
    RECORD_SINKS.zohoCallActivity,
  )
  const [dismissedInsights, setDismissedInsights] = React.useState<string[]>([])
  const [sectioned, setSectioned] = React.useState(SECTIONED_PROMPTS)
  const [rawOpen, setRawOpen] = React.useState(false)

  /** Every edit on this screen is the same kind of edit — one save bar. */
  const edit = <T,>(setter: (value: T) => void) => {
    return (value: T) => {
      setter(value)
      setDirty(true)
    }
  }

  const current =
    perLanguage.find((entry) => entry.language === language) ?? perLanguage[0]

  const updateCurrent = (patch: Partial<(typeof perLanguage)[number]>) => {
    setPerLanguage((entries) =>
      entries.map((entry) =>
        entry.language === language ? { ...entry, ...patch } : entry,
      ),
    )
    setDirty(true)
  }

  const currentSections =
    sectioned.find((entry) => entry.language === language) ?? sectioned[0]

  const updateSections = (next: SectionedPrompt) => {
    setSectioned((entries) =>
      entries.map((entry) => (entry.language === language ? next : entry)),
    )
    setDirty(true)
  }

  /* The prompt spends names the variables table does not declare — the agent's
     own name comes from the persona, not from a column. Both are offered. */
  const insertableVariables = [
    ...IMPLICIT_VARIABLES,
    ...variables.map((variable) => variable.name),
  ]

  const spokenLanguages = perLanguage.map((entry) => entry.language)
  const attachedBases = bases.filter((base) => base.attached)
  const enabledTools = tools.filter((tool) => tool.enabled)
  const enabledDestinations = destinations.filter(
    (destination) => destination.enabled,
  )
  const openInsights = UNRESOLVED_INSIGHTS - dismissedInsights.length

  const reset = () => {
    setPerLanguage(PER_LANGUAGE)
    setSectioned(SECTIONED_PROMPTS)
    setDefaultLanguage(DEFAULT_LANGUAGE)
    setTimezone(TIMEZONE)
    setBases(KNOWLEDGE_BASES)
    setTools(TOOLS)
    setCriteria(SUCCESS_CRITERIA)
    setVariables(TEMPLATE_VARIABLES)
    setExtractionOn(DATA_EXTRACTION.enabled)
    setDestinations(DESTINATIONS)
    setZohoRecording(RECORD_SINKS.zohoCallActivity)
    setDirty(false)
  }

  return (
    <div className="flex flex-1 flex-col p-3 lg:p-4">
      <div className="mx-auto flex w-full max-w-350 flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{SCENARIO.name}</h1>
              <Badge className="bg-success/10 text-success">Active</Badge>
            </div>
            {/* The four numbers the header carried before, as one line. They
                are context for the editing below, not a dashboard. */}
            <p className="text-sm text-muted-foreground">
              {SCENARIO.calls.toLocaleString()} calls · {SCENARIO.successRate}%
              met success criteria · Created {SCENARIO.createdAt} · Published{" "}
              {SCENARIO.lastPublished}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={() => {
                setOpenSetting("insights")
              }}
              variant="outline"
            >
              <InsightsIcon />
              Insights
              <Badge variant="secondary">{openInsights}</Badge>
            </Button>
            <Button variant="outline">
              <TestCallIcon />
              Test
            </Button>
            <Button>
              <PublishIcon />
              Publish
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* What the agent says. The only thing on this screen a person
              writes rather than picks, so it gets the width. */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Writing the {LANGUAGE_LABELS[current.language]} version
                {current.language === defaultLanguage ? " — the default" : ""}
              </p>
              <ToggleGroup
                onValueChange={(next) => {
                  if (next) setLanguage(next as LanguageCode)
                }}
                size="sm"
                type="single"
                value={language}
                variant="outline"
              >
                {perLanguage.map((entry) => (
                  <ToggleGroupItem
                    aria-label={LANGUAGE_LABELS[entry.language]}
                    key={entry.language}
                    value={entry.language}
                  >
                    {LANGUAGE_SHORT[entry.language]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>First message</CardTitle>
                <CardDescription>
                  What the agent opens the call with. Leave it off to let the
                  caller speak first.
                </CardDescription>
                <CardAction>
                  <Switch
                    aria-label="First message"
                    checked={current.firstMessageEnabled}
                    onCheckedChange={(checked) => {
                      updateCurrent({ firstMessageEnabled: checked })
                    }}
                  />
                </CardAction>
              </CardHeader>
              <CardContent>
                <Input
                  aria-label="First message"
                  dir={
                    current.language === "ar" || current.language === "ur"
                      ? "rtl"
                      : "ltr"
                  }
                  disabled={!current.firstMessageEnabled}
                  onChange={(event) => {
                    updateCurrent({ firstMessage: event.target.value })
                  }}
                  value={current.firstMessage}
                />
              </CardContent>
            </Card>

            <PromptBuilder
              onChange={updateSections}
              onOpenRaw={() => {
                setRawOpen(true)
              }}
              onOpenVariables={() => {
                setOpenSetting("variables")
              }}
              prompt={currentSections}
              rtl={current.language === "ar" || current.language === "ur"}
              variables={insertableVariables}
            />
          </div>

          {/* Everything the scenario is set to, readable without opening a
              thing. The rail is the replacement for the Configuration tab. */}
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:w-96">
            <RailGroup title="How it speaks">
              <SettingRow
                icon={PersonaIcon}
                onOpen={() => {
                  setOpenSetting("persona")
                }}
                title="Persona"
                value={current.persona}
              />
              <SettingRow
                icon={LanguagesIcon}
                onOpen={() => {
                  setOpenSetting("languages")
                }}
                title="Languages"
                value={`${spokenLanguages
                  .map((code) => LANGUAGE_LABELS[code])
                  .join(", ")} · ${LANGUAGE_LABELS[defaultLanguage]} default`}
              />
              <SettingRow
                icon={TimezoneIcon}
                onOpen={() => {
                  setOpenSetting("timezone")
                }}
                title="Timezone"
                value={timezone}
              />
            </RailGroup>

            <RailGroup title="What it knows and can do">
              <SettingRow
                icon={KnowledgeIcon}
                onOpen={() => {
                  setOpenSetting("knowledge")
                }}
                title="Knowledge bases"
                value={
                  attachedBases.length === 0
                    ? "None attached"
                    : attachedBases.map((base) => base.name).join(", ")
                }
              />
              <SettingRow
                icon={ToolsIcon}
                onOpen={() => {
                  setOpenSetting("tools")
                }}
                title="Tools"
                value={
                  enabledTools.length === 0
                    ? "None enabled"
                    : enabledTools.map((tool) => tool.label).join(", ")
                }
              />
              <SettingRow
                icon={VariablesIcon}
                onOpen={() => {
                  setOpenSetting("variables")
                }}
                title="Template variables"
                value={`${variables.length} · ${
                  variables.filter((variable) => variable.required).length
                } required`}
              />
            </RailGroup>

            <RailGroup title="When the call ends">
              <SettingRow
                icon={CriteriaIcon}
                onOpen={() => {
                  setOpenSetting("criteria")
                }}
                title="Success criteria"
                value={`${criteria.length} criteria · ${
                  criteria.filter((criterion) => criterion.primary).length
                } primary`}
              />
              <SettingRow
                icon={ExtractionIcon}
                onOpen={() => {
                  setOpenSetting("extraction")
                }}
                title="Data extraction"
                value={
                  extractionOn
                    ? `${DATA_EXTRACTION.fields.length} fields → ${
                        enabledDestinations.length === 0
                          ? "nowhere yet"
                          : enabledDestinations
                              .map((destination) => destination.label)
                              .join(", ")
                      }`
                    : "Off"
                }
              />
              <SettingRow
                icon={RecordingIcon}
                onOpen={() => {
                  setOpenSetting("recording")
                }}
                title="Recording delivery"
                value={zohoRecording ? "Zoho call activity" : "Not delivered"}
              />
            </RailGroup>

            {isStaff ? (
              <RailGroup title="Sarj staff">
                <SettingRow
                  icon={OpportunitiesIcon}
                  onOpen={() => {
                    setOpenSetting("opportunities")
                  }}
                  title="Optimization opportunities"
                  value={`${OPPORTUNITIES.length} open`}
                />
                <SettingRow
                  icon={OwnershipIcon}
                  onOpen={() => {
                    setOpenSetting("ownership")
                  }}
                  title="Owning organization"
                  value="Sizzler KSA"
                />
              </RailGroup>
            ) : null}
          </aside>
        </div>
      </div>

      {/* One save bar for the page and every drawer on it, so there is a
          single answer to "is this live yet". */}
      {dirty ? (
        <div className="sticky bottom-4 z-sticky mx-auto mt-6 w-full max-w-350">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-warning">
                  <UnsavedIcon />
                </span>
                <p className="text-sm font-medium">You have unsaved changes</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={reset} variant="outline">
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    setDirty(false)
                  }}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* --- the drawers ------------------------------------------------- */}

      <SettingSheet
        description="One voice per language. The persona also carries the turn timing and backchannel settings that language uses."
        onOpenChange={(open) => {
          setOpenSetting(open ? "persona" : null)
        }}
        open={openSetting === "persona"}
        title="Persona"
      >
        <PersonaDrawerBody
          onPersonaChange={(code, persona) => {
            setPerLanguage((entries) =>
              entries.map((entry) =>
                entry.language === code ? { ...entry, persona } : entry,
              ),
            )
            setDirty(true)
          }}
          perLanguage={perLanguage}
        />
      </SettingSheet>

      <SettingSheet
        description="Each language keeps its own prompt, first message and persona."
        onOpenChange={(open) => {
          setOpenSetting(open ? "languages" : null)
        }}
        open={openSetting === "languages" || openSetting === "timezone"}
        title="Languages and timezone"
      >
        <LanguagesDrawerBody
          defaultLanguage={defaultLanguage}
          onDefaultChange={edit(setDefaultLanguage)}
          onTimezoneChange={edit(setTimezone)}
          perLanguage={perLanguage}
          timezone={timezone}
        />
      </SettingSheet>

      <SettingSheet
        description="Attached bases are searched when the agent needs a fact it was not told."
        onOpenChange={(open) => {
          setOpenSetting(open ? "knowledge" : null)
        }}
        open={openSetting === "knowledge"}
        title="Knowledge bases"
      >
        <KnowledgeDrawerBody
          bases={bases}
          onToggle={(name) => {
            setBases((entries) =>
              entries.map((base) =>
                base.name === name
                  ? { ...base, attached: !base.attached }
                  : base,
              ),
            )
            setDirty(true)
          }}
          spokenLanguages={spokenLanguages}
        />
      </SettingSheet>

      <SettingSheet
        description="Actions the agent can take during a call, beyond talking."
        onOpenChange={(open) => {
          setOpenSetting(open ? "tools" : null)
        }}
        open={openSetting === "tools"}
        title="Tools"
      >
        <ToolsDrawerBody
          onToggle={(slug: ToolSlug) => {
            setTools((entries) =>
              entries.map((tool) =>
                tool.slug === slug ? { ...tool, enabled: !tool.enabled } : tool,
              ),
            )
            setDirty(true)
          }}
          tools={tools}
        />
      </SettingSheet>

      <SettingSheet
        description="What a call has to achieve to be scored as successful."
        onOpenChange={(open) => {
          setOpenSetting(open ? "criteria" : null)
        }}
        open={openSetting === "criteria"}
        title="Success criteria"
      >
        <CriteriaDrawerBody
          criteria={criteria}
          onCriteriaChange={edit(setCriteria)}
        />
      </SettingSheet>

      <SettingSheet
        description="Placeholders the prompt and first message fill in when a call starts."
        onOpenChange={(open) => {
          setOpenSetting(open ? "variables" : null)
        }}
        open={openSetting === "variables"}
        title="Template variables"
      >
        <VariablesDrawerBody
          onVariablesChange={edit(setVariables)}
          variables={variables}
        />
      </SettingSheet>

      <SettingSheet
        description="Fields read out of the transcript when the call ends, and where they go."
        onOpenChange={(open) => {
          setOpenSetting(open ? "extraction" : null)
        }}
        open={openSetting === "extraction"}
        title="Data extraction"
      >
        <ExtractionDrawerBody
          destinations={destinations}
          enabled={extractionOn}
          fields={DATA_EXTRACTION.fields}
          onDestinationToggle={(type: Destination["type"]) => {
            setDestinations((entries) =>
              entries.map((destination) =>
                destination.type === type
                  ? { ...destination, enabled: !destination.enabled }
                  : destination,
              ),
            )
            setDirty(true)
          }}
          onEnabledChange={edit(setExtractionOn)}
        />
      </SettingSheet>

      <SettingSheet
        description="Where the call recording is sent once the call ends."
        onOpenChange={(open) => {
          setOpenSetting(open ? "recording" : null)
        }}
        open={openSetting === "recording"}
        title="Recording delivery"
      >
        <RecordingDrawerBody
          onZohoChange={edit(setZohoRecording)}
          zohoCallActivity={zohoRecording}
        />
      </SettingSheet>

      <SettingSheet
        description="What the last 90 days of calls say about this scenario."
        onOpenChange={(open) => {
          setOpenSetting(open ? "insights" : null)
        }}
        open={openSetting === "insights"}
        title="Insights"
      >
        <InsightsDrawerBody
          dismissed={dismissedInsights}
          insights={INSIGHTS}
          onDismiss={(title) => {
            setDismissedInsights((titles) => [...titles, title])
          }}
          onOpenTarget={(target) => {
            setOpenSetting(INSIGHT_TARGETS[target])
          }}
        />
      </SettingSheet>

      <SettingSheet
        description="Cost and quality wins Sarj staff can act on for this scenario."
        onOpenChange={(open) => {
          setOpenSetting(open ? "opportunities" : null)
        }}
        open={openSetting === "opportunities"}
        title="Optimization opportunities"
      >
        <OpportunitiesDrawerBody opportunities={OPPORTUNITIES} />
      </SettingSheet>

      <SettingSheet
        description="Move this scenario to another organization."
        onOpenChange={(open) => {
          setOpenSetting(open ? "ownership" : null)
        }}
        open={openSetting === "ownership"}
        title="Owning organization"
      >
        <OwnershipDrawerBody attachedBases={attachedBases.length} />
      </SettingSheet>

      <RawPromptDrawer
        onOpenChange={setRawOpen}
        open={rawOpen}
        prompt={currentSections}
        rtl={current.language === "ar" || current.language === "ur"}
      />
    </div>
  )
}
