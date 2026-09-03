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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FLOW_META,
  SECTION_META,
  SECTION_TOTAL,
  filledCount,
  variableLabel,
  type SectionedPrompt,
} from "@/lib/scenario-single-screen-v2-data"
import { cn } from "@/lib/utils"

import {
  AddIcon,
  DragStepIcon,
  RawPromptIcon,
  RemoveIcon,
} from "@/components/scenario-single-screen/v2/icons"

/**
 * The instruction prompt, written as the six things it says.
 *
 * The review said the prompting area is not intuitive for a business user, and
 * the reason is that the prompt was never one thing: it is already an identity,
 * a refusal, a goal, a script, a tone and an escalation rule, glued together
 * with `#` headings. A person who has not written a prompt before cannot see
 * that, so they get a wall of monospace and no idea whether they have missed
 * anything.
 *
 * Each of those becomes a field with a plain label, one line saying what
 * belongs in it, and an example in the placeholder. The call script becomes a
 * numbered list, because it is the one part that is genuinely ordered and free
 * text hides that. Nothing is taken away — `Raw prompt` opens exactly what the
 * model is sent, and the markdown it shows is byte-identical to what v1 stores.
 */
export function PromptBuilder({
  onChange,
  onOpenRaw,
  onOpenVariables,
  prompt,
  rtl,
  variables,
}: {
  onChange: (prompt: SectionedPrompt) => void
  onOpenRaw: () => void
  onOpenVariables: () => void
  prompt: SectionedPrompt
  rtl: boolean
  /** Variable names the prompt may spend, already ordered for display. */
  variables: string[]
}) {
  const dir = rtl ? "rtl" : "ltr"
  const filled = filledCount(prompt)
  const complete = filled === SECTION_TOTAL

  const set = (patch: Partial<SectionedPrompt>) =>
    onChange({ ...prompt, ...patch })

  return (
    <Card>
      <CardHeader>
        <CardTitle>What the agent does</CardTitle>
        <CardDescription>
          Six things it needs to know, in your own words. It follows them for
          the whole call.
        </CardDescription>

        <CardAction className="flex items-center gap-2">
          {/* A business user's real question is "am I done?", and a blob of
              text cannot answer it. The count can. */}
          <Badge
            className={cn(
              "tabular-nums",
              complete && "bg-success-tint text-success-tint-foreground",
            )}
            variant="secondary"
          >
            {filled} of {SECTION_TOTAL} filled
          </Badge>

          {/* The escape hatch. Everything above is a view onto this, so the
              people who were happy writing markdown lose nothing. */}
          <Button onClick={onOpenRaw} size="sm" variant="outline">
            <RawPromptIcon />
            Raw prompt
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          {SECTION_META.map((meta) => (
            <React.Fragment key={meta.id}>
              <SectionField
                dir={dir}
                example={meta.example}
                help={meta.help}
                label={meta.label}
                onChange={(value) =>
                  set({ [meta.id]: value } as Partial<SectionedPrompt>)
                }
                onOpenVariables={onOpenVariables}
                value={prompt[meta.id]}
                variables={variables}
              />

              {/* The script sits after the goal, where it does in the prompt
                  the model is sent — the order on screen is the order it runs. */}
              {meta.id === "context" ? (
                <FlowField
                  dir={dir}
                  onChange={(flow) => set({ flow })}
                  steps={prompt.flow}
                />
              ) : null}
            </React.Fragment>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

/**
 * One prose section.
 *
 * The variable chips appear only while this field has focus: six permanent
 * chip rows would be six copies of the same list, and the moment a person
 * needs them is the moment they are typing.
 */
function SectionField({
  dir,
  example,
  help,
  label,
  onChange,
  onOpenVariables,
  value,
  variables,
}: {
  dir: "ltr" | "rtl"
  example: string
  help: string
  label: string
  onChange: (value: string) => void
  onOpenVariables: () => void
  value: string
  variables: string[]
}) {
  const field = React.useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = React.useState(false)

  function insert(name: string) {
    const element = field.current
    if (!element) return

    const token = `{{${name}}}`
    const start = element.selectionStart ?? value.length
    const end = element.selectionEnd ?? start
    onChange(value.slice(0, start) + token + value.slice(end))

    /* Put the caret after what was just inserted, so a second chip does not
       land inside the first. */
    requestAnimationFrame(() => {
      element.focus()
      element.setSelectionRange(start + token.length, start + token.length)
    })
  }

  return (
    <Field>
      <FieldTitle>{label}</FieldTitle>
      <FieldDescription>{help}</FieldDescription>

      <Textarea
        aria-label={label}
        className="min-h-20"
        dir={dir}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={`For example: ${example}`}
        ref={field}
        value={value}
      />

      {focused ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Insert</span>
          {variables.map((name) => (
            <Button
              key={name}
              /* Mouse-down would blur the textarea before the click lands,
                 taking the caret — and the chip row — with it. */
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => insert(name)}
              size="xs"
              type="button"
              variant="secondary"
            >
              {variableLabel(name)}
            </Button>
          ))}
          <Button
            onMouseDown={(event) => event.preventDefault()}
            onClick={onOpenVariables}
            size="xs"
            variant="ghost"
          >
            Manage
          </Button>
        </div>
      ) : null}
    </Field>
  )
}

/**
 * The call script, as ordered steps.
 *
 * Written as a paragraph the order is invisible, and order is the whole point
 * — the agent works down it. Numbering it makes that legible, and makes "move
 * the confirmation before the close" a drag rather than a rewrite.
 */
function FlowField({
  dir,
  onChange,
  steps,
}: {
  dir: "ltr" | "rtl"
  onChange: (steps: string[]) => void
  steps: string[]
}) {
  const [dragging, setDragging] = React.useState<number | null>(null)

  function move(from: number, to: number) {
    if (to < 0 || to >= steps.length) return
    const next = [...steps]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  return (
    <Field>
      <FieldTitle>{FLOW_META.label}</FieldTitle>
      <FieldDescription>{FLOW_META.help}</FieldDescription>

      <div className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <div
            className={cn(
              "flex items-center gap-2",
              dragging === index && "opacity-60",
            )}
            draggable={dragging === index}
            key={index}
            onDragEnd={() => setDragging(null)}
            onDragEnter={() => {
              if (dragging !== null && dragging !== index) {
                move(dragging, index)
                setDragging(index)
              }
            }}
            onDragOver={(event) => event.preventDefault()}
          >
            {/* Arming the drag on the grip alone keeps the text selectable —
                a row that is always draggable cannot be edited with a mouse. */}
            <Button
              aria-label={`Reorder step ${index + 1}`}
              className="cursor-grab"
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault()
                  move(index, index - 1)
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  move(index, index + 1)
                }
              }}
              onPointerDown={() => setDragging(index)}
              onPointerUp={() => setDragging(null)}
              size="icon-sm"
              variant="ghost"
            >
              <DragStepIcon />
            </Button>

            <Badge className="tabular-nums" variant="secondary">
              {index + 1}
            </Badge>

            <Input
              aria-label={`Step ${index + 1}`}
              dir={dir}
              onChange={(event) => {
                const next = [...steps]
                next[index] = event.target.value
                onChange(next)
              }}
              value={step}
            />

            <Button
              aria-label={`Remove step ${index + 1}`}
              onClick={() => onChange(steps.filter((_, at) => at !== index))}
              size="icon-sm"
              variant="ghost"
            >
              <RemoveIcon />
            </Button>
          </div>
        ))}

        <div>
          <Button
            onClick={() => onChange([...steps, ""])}
            size="sm"
            variant="outline"
          >
            <AddIcon />
            Add step
          </Button>
        </div>
      </div>

      {steps.length ? null : (
        <FieldDescription>
          No steps yet. The agent will improvise the order of the call.
        </FieldDescription>
      )}

      <FieldSeparator />
    </Field>
  )
}
