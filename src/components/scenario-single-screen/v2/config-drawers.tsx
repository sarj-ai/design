"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  AddIcon,
  CollectDigitsToolIcon,
  EndCallToolIcon,
  FindIcon,
  HttpRequestToolIcon,
  IvrToolIcon,
  RemoveIcon,
  SallaToolIcon,
  SwitchLanguageToolIcon,
  TransferToolIcon,
  VoicemailToolIcon,
  ZohoTicketToolIcon,
} from "@/components/scenario-single-screen/v2/icons"
import { SheetSection } from "@/components/scenario-single-screen/v2/setting-sheet"
import {
  type Destination,
  type ExtractionField,
  type KnowledgeBase,
  LANGUAGE_LABELS,
  type LanguageCode,
  type PerLanguage,
  PERSONAS,
  type SuccessCriterion,
  type TemplateVariable,
  type Tool,
  type ToolSlug,
} from "@/lib/scenario-single-screen-data"

const TIMEZONES = [
  "Asia/Riyadh",
  "Asia/Dubai",
  "Asia/Karachi",
  "Africa/Cairo",
  "Europe/London",
]

const TOOL_ICONS: Record<ToolSlug, React.ComponentType> = {
  "code-switching": SwitchLanguageToolIcon,
  "collect-digits": CollectDigitsToolIcon,
  "custom-api": HttpRequestToolIcon,
  "end-call": EndCallToolIcon,
  "ivr-navigation": IvrToolIcon,
  "salla-tools": SallaToolIcon,
  "transfer-to-human": TransferToolIcon,
  "voicemail-detection": VoicemailToolIcon,
  "zoho-desk-create-ticket": ZohoTicketToolIcon,
}

/* --------------------------------------------------------------- persona -- */

/**
 * A persona per language, because that is how the scenario stores it — one
 * voice cannot speak all three. Listing every configured language at once is
 * what stops this reading as a single "voice" dropdown that silently belongs
 * to whichever language you last had selected.
 */
export function PersonaDrawerBody({
  onPersonaChange,
  perLanguage,
}: {
  onPersonaChange: (language: LanguageCode, persona: string) => void
  perLanguage: PerLanguage[]
}) {
  return (
    <FieldGroup>
      {perLanguage.map((entry) => (
        <Field key={entry.language}>
          <FieldLabel htmlFor={`persona-${entry.language}`}>
            {LANGUAGE_LABELS[entry.language]}
          </FieldLabel>
          <Select
            onValueChange={(persona) => {
              onPersonaChange(entry.language, persona)
            }}
            value={entry.persona}
          >
            <SelectTrigger id={`persona-${entry.language}`}>
              <SelectValue placeholder="Select a persona" />
            </SelectTrigger>
            <SelectContent>
              {PERSONAS.map((persona) => (
                <SelectItem key={persona} value={persona}>
                  {persona}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Speaks the {LANGUAGE_LABELS[entry.language]} prompt and first
            message.
          </FieldDescription>
        </Field>
      ))}
    </FieldGroup>
  )
}

/* ------------------------------------------------------------- languages -- */

export function LanguagesDrawerBody({
  defaultLanguage,
  onDefaultChange,
  onTimezoneChange,
  perLanguage,
  timezone,
}: {
  defaultLanguage: LanguageCode
  onDefaultChange: (language: LanguageCode) => void
  onTimezoneChange: (timezone: string) => void
  perLanguage: PerLanguage[]
  timezone: string
}) {
  return (
    <>
      <SheetSection
        description="The default is the language a call opens in when the caller's is unknown."
        title="Configured languages"
      >
        <RadioGroup
          onValueChange={(value) => {
            onDefaultChange(value as LanguageCode)
          }}
          value={defaultLanguage}
        >
          <ItemGroup className="gap-2">
            {perLanguage.map((entry) => (
              <Item key={entry.language} size="sm" variant="outline">
                <ItemMedia>
                  <RadioGroupItem
                    id={`default-${entry.language}`}
                    value={entry.language}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    <Label htmlFor={`default-${entry.language}`}>
                      {LANGUAGE_LABELS[entry.language]}
                    </Label>
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  {entry.language === defaultLanguage ? (
                    <Badge variant="secondary">Default</Badge>
                  ) : (
                    <Button
                      aria-label={`Remove ${LANGUAGE_LABELS[entry.language]}`}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <RemoveIcon />
                    </Button>
                  )}
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </RadioGroup>
        <Button size="sm" variant="outline">
          <AddIcon />
          Add a language
        </Button>
      </SheetSection>

      <SheetSection
        description="Dates and times the caller gives are read against this zone."
        title="Timezone"
      >
        <Select onValueChange={onTimezoneChange} value={timezone}>
          <SelectTrigger aria-label="Timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((zone) => (
              <SelectItem key={zone} value={zone}>
                {zone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SheetSection>
    </>
  )
}

/* --------------------------------------------------------------- knowledge -- */

/**
 * Language coverage sits on every row, attached or not. A base with no content
 * in a language the scenario speaks is the failure this screen has to make
 * visible before it is attached, not after a call goes wrong.
 */
export function KnowledgeDrawerBody({
  bases,
  onToggle,
  spokenLanguages,
}: {
  bases: KnowledgeBase[]
  onToggle: (name: string) => void
  spokenLanguages: LanguageCode[]
}) {
  const [query, setQuery] = React.useState("")

  const matches = bases.filter((base) =>
    base.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <>
      <InputGroup>
        <InputGroupAddon>
          <FindIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search knowledge bases"
          onChange={(event) => {
            setQuery(event.target.value)
          }}
          placeholder="Search knowledge bases…"
          value={query}
        />
      </InputGroup>

      <ItemGroup className="gap-2">
        {matches.map((base) => {
          const gaps = spokenLanguages.filter(
            (language) => !base.languages.includes(language),
          )

          return (
            <Item key={base.name} size="sm" variant="outline">
              <ItemMedia>
                <Checkbox
                  checked={base.attached}
                  id={`kb-${base.name}`}
                  onCheckedChange={() => {
                    onToggle(base.name)
                  }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  <Label htmlFor={`kb-${base.name}`}>{base.name}</Label>
                </ItemTitle>
                <ItemDescription>
                  {base.documents} documents ·{" "}
                  {base.languages
                    .map((language) => LANGUAGE_LABELS[language])
                    .join(", ")}
                </ItemDescription>
              </ItemContent>
              {gaps.length > 0 && base.attached ? (
                <ItemActions>
                  <Badge variant="destructive">
                    No{" "}
                    {gaps
                      .map((language) => LANGUAGE_LABELS[language])
                      .join(", ")}
                  </Badge>
                </ItemActions>
              ) : null}
            </Item>
          )
        })}
      </ItemGroup>
    </>
  )
}

/* ------------------------------------------------------------------- tools -- */

/**
 * A tool's own configuration only appears once it is on. Nine tools each
 * showing their settings is the density that made the Configuration tab
 * unreadable; the switch is the disclosure.
 */
export function ToolsDrawerBody({
  onToggle,
  tools,
}: {
  onToggle: (slug: ToolSlug) => void
  tools: Tool[]
}) {
  return (
    <FieldGroup>
      {tools.map((tool) => {
        const Icon = TOOL_ICONS[tool.slug]

        return (
          <Field key={tool.slug} orientation="horizontal">
            <ItemMedia variant="icon">
              <Icon />
            </ItemMedia>
            <FieldContent>
              <FieldTitle>{tool.label}</FieldTitle>
              <FieldDescription>{tool.description}</FieldDescription>
              {tool.enabled && tool.summary ? (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">
                    {tool.summary}
                  </p>
                  <Button size="xs" variant="outline">
                    Edit
                  </Button>
                </div>
              ) : null}
            </FieldContent>
            <Switch
              aria-label={tool.label}
              checked={tool.enabled}
              onCheckedChange={() => {
                onToggle(tool.slug)
              }}
            />
          </Field>
        )
      })}
    </FieldGroup>
  )
}

/* -------------------------------------------------------- success criteria -- */

export function CriteriaDrawerBody({
  criteria,
  onCriteriaChange,
}: {
  criteria: SuccessCriterion[]
  onCriteriaChange: (criteria: SuccessCriterion[]) => void
}) {
  return (
    <>
      <FieldGroup>
        {criteria.map((criterion, index) => (
          <Field key={index}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor={`criterion-${index}`}>
                Criterion {index + 1}
                {criterion.primary ? (
                  <Badge variant="secondary">Primary</Badge>
                ) : null}
              </FieldLabel>
              <Button
                aria-label={`Remove criterion ${index + 1}`}
                onClick={() => {
                  onCriteriaChange(criteria.filter((_, i) => i !== index))
                }}
                size="icon-sm"
                variant="ghost"
              >
                <RemoveIcon />
              </Button>
            </div>
            <Textarea
              id={`criterion-${index}`}
              onChange={(event) => {
                onCriteriaChange(
                  criteria.map((item, i) =>
                    i === index ? { ...item, text: event.target.value } : item,
                  ),
                )
              }}
              rows={3}
              value={criterion.text}
            />
          </Field>
        ))}
      </FieldGroup>

      <Button
        onClick={() => {
          onCriteriaChange([...criteria, { primary: false, text: "" }])
        }}
        size="sm"
        variant="outline"
      >
        <AddIcon />
        Add a criterion
      </Button>
    </>
  )
}

/* ------------------------------------------------------ template variables -- */

export function VariablesDrawerBody({
  onVariablesChange,
  variables,
}: {
  onVariablesChange: (variables: TemplateVariable[]) => void
  variables: TemplateVariable[]
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variable</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Used in</TableHead>
              <TableHead className="text-end">Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variables.map((variable, index) => (
              <TableRow key={variable.name}>
                <TableCell className="font-mono">{variable.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {variable.type}
                </TableCell>
                <TableCell>
                  <Input
                    aria-label={`Default value for ${variable.name}`}
                    onChange={(event) => {
                      onVariablesChange(
                        variables.map((item, i) =>
                          i === index
                            ? { ...item, defaultValue: event.target.value }
                            : item,
                        ),
                      )
                    }}
                    placeholder="—"
                    value={variable.defaultValue}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {variable.usedIn
                    .map((language) => language.toUpperCase())
                    .join(", ")}
                </TableCell>
                <TableCell className="text-end">
                  <Checkbox
                    aria-label={`${variable.name} is required`}
                    checked={variable.required}
                    onCheckedChange={() => {
                      onVariablesChange(
                        variables.map((item, i) =>
                          i === index
                            ? { ...item, required: !item.required }
                            : item,
                        ),
                      )
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button size="sm" variant="outline">
        <AddIcon />
        Add a variable
      </Button>
    </>
  )
}

/* -------------------------------------------------------- data extraction -- */

export function ExtractionDrawerBody({
  destinations,
  enabled,
  fields,
  onDestinationToggle,
  onEnabledChange,
}: {
  destinations: Destination[]
  enabled: boolean
  fields: ExtractionField[]
  onDestinationToggle: (type: Destination["type"]) => void
  onEnabledChange: (enabled: boolean) => void
}) {
  return (
    <>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>Extract data from every call</FieldTitle>
          <FieldDescription>
            Fields below are read out of the transcript when the call ends.
          </FieldDescription>
        </FieldContent>
        <Switch
          aria-label="Extract data from every call"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </Field>

      <SheetSection title="Fields">
        <ItemGroup className="gap-2">
          {fields.map((field) => (
            <Item key={field.name} size="sm" variant="outline">
              <ItemContent>
                <ItemTitle className="font-mono">{field.name}</ItemTitle>
                <ItemDescription>{field.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant="outline">{field.type}</Badge>
                {field.required ? (
                  <Badge variant="secondary">Required</Badge>
                ) : null}
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
        <Button size="sm" variant="outline">
          <AddIcon />
          Add a field
        </Button>
      </SheetSection>

      <SheetSection
        description="Where the extracted fields are written once the call ends."
        title="Destinations"
      >
        <FieldGroup>
          {destinations.map((destination) => (
            <Field key={destination.type} orientation="horizontal">
              <FieldContent>
                <FieldTitle>
                  {destination.label}
                  {destination.connected ? null : (
                    <Badge variant="outline">Not connected</Badge>
                  )}
                </FieldTitle>
                <FieldDescription>{destination.description}</FieldDescription>
              </FieldContent>
              {destination.connected ? (
                <Switch
                  aria-label={destination.label}
                  checked={destination.enabled}
                  onCheckedChange={() => {
                    onDestinationToggle(destination.type)
                  }}
                />
              ) : (
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              )}
            </Field>
          ))}
        </FieldGroup>
      </SheetSection>
    </>
  )
}

/* --------------------------------------------------- call recording delivery -- */

export function RecordingDrawerBody({
  onZohoChange,
  zohoCallActivity,
}: {
  onZohoChange: (enabled: boolean) => void
  zohoCallActivity: boolean
}) {
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldTitle>Zoho call activity</FieldTitle>
        <FieldDescription>
          Attach the recording to the matching Zoho CRM call activity when the
          call ends.
        </FieldDescription>
      </FieldContent>
      <Switch
        aria-label="Zoho call activity"
        checked={zohoCallActivity}
        onCheckedChange={onZohoChange}
      />
    </Field>
  )
}
