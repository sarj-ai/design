"use client"

import * as React from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { InputGroup } from "@/components/ui/input-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  KIND_LABEL,
  KIND_ORDER,
  describe,
  type Variable,
} from "@/lib/mockups/variable-mentions-data"
import { cn } from "@/lib/utils"

import {
  chipClass,
  type ChipTreatment,
} from "@/components/mockups/variable-mentions/chip-treatment"
import {
  InsertKeyIcon,
  MoveDownKeyIcon,
  MoveUpKeyIcon,
} from "@/components/mockups/variable-mentions/icons"

/** The stored form of a mention. */
const TOKEN = /\{\{\s*([\w-]+)\s*\}\}/g

/**
 * An `@` at the start of a run of text or after a space or an opening
 * bracket, then whatever has been typed since. `user@domain.com` never
 * matches, and `@ ` stops matching the moment the space lands — the two
 * rules PROD-80 sets for when the picker is open.
 */
const TRIGGER = /(?:^|[\s(["'«“])@(\w*)$/

const KEYCAP = "bg-foreground/10 text-foreground"

interface Box {
  height: number
  left: number
  top: number
  width: number
}

interface Mention {
  box: Box
  node: Text
  query: string
  start: number
}

/**
 * A text field whose variables are chips.
 *
 * The stored value is still the string with `{{name}}` in it, exactly what
 * the product saves today. The editor paints that string into the field,
 * turning each token into a chip, and reads the field back into the string
 * on every edit. Typing `@` opens the picker at the caret; picking inserts a
 * chip. Typing or pasting `{{name}}` by hand becomes a chip too, which is
 * how an existing scenario opens looking right without a migration.
 *
 * The field is a contenteditable rather than a textarea because a textarea
 * cannot hold a chip. It stays uncontrolled on purpose — repainting from
 * state on every keystroke would take the caret with it — so React owns the
 * frame, the picker and the tooltip, and the DOM owns the text.
 */
export function MentionEditor({
  ariaLabel,
  dir,
  disabled = false,
  multiline = false,
  onChange,
  placeholder,
  treatment,
  value,
  variables,
  variablesLoading = false,
}: {
  ariaLabel: string
  dir: "ltr" | "rtl"
  disabled?: boolean
  multiline?: boolean
  onChange: (value: string) => void
  placeholder: string
  treatment: ChipTreatment
  /** The stored string, `{{name}}` tokens included. */
  value: string
  /** Everything that can be mentioned, in the order the picker lists it. */
  variables: Variable[]
  /** The picker shows placeholders instead of rows until the list arrives. */
  variablesLoading?: boolean
}) {
  const root = React.useRef<HTMLDivElement>(null)
  /* The last string this editor read out of its own DOM. A `value` prop
     equal to it is our own edit coming back, not a change to paint. */
  const emitted = React.useRef<string | null>(null)
  const painted = React.useRef<{
    treatment: ChipTreatment
    variables: Variable[]
  } | null>(null)

  const [mention, setMention] = React.useState<Mention | null>(null)
  /* The highlighted row, remembered with the query it was chosen for: a new
     query starts at the top of the list again. */
  const [choice, setChoice] = React.useState<{
    name: string
    query: string
  } | null>(null)
  const [hover, setHover] = React.useState<{ box: Box; name: string } | null>(
    null,
  )

  const byName = React.useMemo(
    () =>
      new Map(
        variables.map((variable, index) => [
          variable.name,
          { index, variable },
        ]),
      ),
    [variables],
  )

  const classFor = React.useCallback(
    (name: string) => {
      const hit = byName.get(name)
      return chipClass(hit?.variable, treatment, hit?.index ?? 0)
    },
    [byName, treatment],
  )

  /* Paint from the stored string when it changes from outside, or when the
     chips need a different class — never on our own keystrokes. */
  React.useEffect(() => {
    const el = root.current
    if (!el) return

    const unchanged =
      emitted.current === value &&
      painted.current?.treatment === treatment &&
      painted.current?.variables === variables
    if (unchanged) return

    paint(el, value, classFor)
    emitted.current = value
    painted.current = { treatment, variables }
  }, [classFor, treatment, value, variables])

  const emit = React.useCallback(() => {
    const el = root.current
    if (!el) return
    const text = serialize(el)
    emitted.current = text
    onChange(text)
  }, [onChange])

  /* Is the caret just after an `@query`? Then the picker belongs there. */
  const sync = React.useCallback(() => {
    const el = root.current
    const selection = window.getSelection()
    const anchor = selection?.anchorNode
    if (
      !el ||
      !selection ||
      !selection.isCollapsed ||
      !anchor ||
      !el.contains(anchor) ||
      anchor.nodeType !== Node.TEXT_NODE
    ) {
      setMention(null)
      return
    }

    const node = anchor as Text
    const before = (node.nodeValue ?? "").slice(0, selection.anchorOffset)
    const match = TRIGGER.exec(before)
    if (!match) {
      setMention(null)
      return
    }

    const query = match[1] ?? ""
    const start = selection.anchorOffset - query.length - 1
    const range = document.createRange()
    range.setStart(node, start)
    range.setEnd(node, selection.anchorOffset)

    setMention({ box: relativeBox(range, el), node, query, start })
  }, [])

  const query = mention?.query.toLowerCase() ?? ""

  const matches = React.useMemo(
    () =>
      variables.filter((variable) =>
        variable.name.toLowerCase().includes(query),
      ),
    [query, variables],
  )

  const groups = KIND_ORDER.map((kind) => ({
    items: matches.filter((variable) => variable.kind === kind),
    kind,
  })).filter((group) => group.items.length > 0)

  const noScenarioVariables = !variables.some(
    (variable) => variable.kind === "scenario",
  )

  const selected =
    choice?.query === query &&
    matches.some((variable) => variable.name === choice.name)
      ? choice.name
      : (matches[0]?.name ?? "")

  const setSelected = React.useCallback(
    (name: string) => setChoice({ name, query }),
    [query],
  )

  const insert = React.useCallback(
    (name: string) => {
      const el = root.current
      const selection = window.getSelection()
      if (!mention || !el || !selection) return

      const { node, start } = mention
      const end =
        selection.anchorNode === node
          ? selection.anchorOffset
          : start + 1 + mention.query.length
      const range = document.createRange()
      range.setStart(node, start)
      range.setEnd(node, Math.min(end, node.length))
      range.deleteContents()

      const chip = createChip(name, classFor(name))
      range.insertNode(chip)
      /* A space after the chip, and the caret after the space, so the next
         word does not land inside the chip and a second `@` starts clean. */
      const space = document.createTextNode(" ")
      chip.after(space)
      const caret = document.createRange()
      caret.setStart(space, 1)
      caret.collapse(true)
      selection.removeAllRanges()
      selection.addRange(caret)

      setMention(null)
      emit()
    },
    [classFor, emit, mention],
  )

  const onInput = () => {
    const el = root.current
    if (!el) return

    if (hasTypedToken(el)) {
      /* `{{name}}` typed or pasted by hand: repaint so it becomes a chip,
         then put the caret back where it was in the stored string. */
      const offset = caretOffset(el)
      const text = serialize(el)
      paint(el, text, classFor)
      if (offset !== null) placeCaret(el, offset)
      emitted.current = text
      onChange(text)
    } else {
      emit()
    }

    sync()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (mention) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        if (matches.length === 0) return
        const current = matches.findIndex(
          (variable) => variable.name === selected,
        )
        const next =
          event.key === "ArrowDown"
            ? Math.min(current + 1, matches.length - 1)
            : Math.max(current - 1, 0)
        setSelected(matches[next]?.name ?? "")
        return
      }
      if (event.key === "Enter") {
        const hit = matches.find((variable) => variable.name === selected)
        if (hit) {
          event.preventDefault()
          insert(hit.name)
          return
        }
      }
      if (event.key === "Escape") {
        event.preventDefault()
        setMention(null)
        return
      }
    }

    if (event.key === "Enter") {
      event.preventDefault()
      /* A newline as text, so the field never grows a `<div>` per line and
         the stored string stays the plain markdown the model is sent. */
      if (multiline) document.execCommand("insertText", false, "\n")
    }
  }

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const chip = (event.target as HTMLElement).closest("[data-variable]")
    const selection = window.getSelection()
    if (chip && selection) {
      /* A chip cannot hold the caret, so a click on one parks it just after. */
      const range = document.createRange()
      range.setStartAfter(chip)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    sync()
  }

  const onMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = root.current
    const chip = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-variable]",
    )
    if (!el || !chip) return
    const range = document.createRange()
    range.selectNode(chip)
    setHover({ box: relativeBox(range, el), name: chip.dataset.variable ?? "" })
  }

  const onMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
    const chip = (event.target as HTMLElement).closest("[data-variable]")
    if (chip && !chip.contains(event.relatedTarget as Node | null)) {
      setHover(null)
    }
  }

  const hovered = hover ? byName.get(hover.name)?.variable : undefined

  return (
    <Popover open={mention !== null}>
      <InputGroup
        className={cn(
          "h-auto items-stretch",
          disabled && "bg-input/50 opacity-50",
        )}
      >
        <div className="relative min-w-0 flex-1" dir={dir}>
          <div
            aria-disabled={disabled || undefined}
            aria-label={ariaLabel}
            aria-multiline={multiline}
            className={cn(
              "w-full px-2.5 text-sm leading-6 break-words whitespace-pre-wrap outline-none",
              multiline ? "min-h-40 py-2" : "py-1",
              disabled && "cursor-not-allowed",
            )}
            contentEditable={!disabled}
            data-slot="input-group-control"
            onBlur={() => setMention(null)}
            onClick={onClick}
            onFocus={sync}
            onInput={onInput}
            onKeyDown={onKeyDown}
            onKeyUp={sync}
            onMouseOut={onMouseOut}
            onMouseOver={onMouseOver}
            ref={root}
            role="textbox"
            spellCheck={false}
            tabIndex={disabled ? -1 : 0}
          />

          {value === "" ? (
            <span
              aria-hidden
              className="pointer-events-none absolute start-2.5 top-1 text-sm leading-6 text-muted-foreground"
            >
              {placeholder}
            </span>
          ) : null}

          {/* The picker and the tooltip each anchor to an empty span parked
              over the caret or the chip they belong to. */}
          <PopoverAnchor asChild>
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={mention?.box}
            />
          </PopoverAnchor>

          <Tooltip open={hover !== null}>
            <TooltipTrigger asChild>
              <span
                aria-hidden
                className="pointer-events-none absolute"
                style={hover?.box}
              />
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {hovered ? KIND_LABEL[hovered.kind].one : "Not defined"}
                </span>
                <span className="text-background/80">
                  {hovered
                    ? describe(hovered)
                    : "Add it under Template variables, or delete the chip."}
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </InputGroup>

      <PopoverContent
        align="start"
        className="w-96 p-0"
        onCloseAutoFocus={(event) => event.preventDefault()}
        /* The editor keeps focus: a mouse-down here would blur it, and the
           caret — which is where the chip has to go — would be gone. */
        onMouseDown={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => event.preventDefault()}
        side="bottom"
        sideOffset={4}
      >
        <Command
          onValueChange={setSelected}
          shouldFilter={false}
          value={selected}
        >
          <CommandList>
            {variablesLoading ? (
              <div className="flex flex-col gap-1 p-1">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  No variables match “{mention?.query}”
                </CommandEmpty>

                {noScenarioVariables && query === "" ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    No scenario variables yet. Add them under Template
                    variables.
                  </p>
                ) : null}

                {groups.map((group) => (
                  <CommandGroup
                    heading={KIND_LABEL[group.kind].group}
                    key={group.kind}
                  >
                    {group.items.map((variable) => (
                      <CommandItem
                        key={variable.name}
                        onSelect={() => insert(variable.name)}
                        value={variable.name}
                      >
                        <div className="flex min-w-0 flex-col">
                          <span>{variable.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {describe(variable)}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>

          {/* Keycaps on the popover surface: the Kbd default is bg-muted,
              which on bg-popover is a three-percent grey and reads as
              nothing. A tenth of foreground gives each key an edge without
              borrowing a chip colour. */}
          <div className="flex items-center gap-4 border-t px-3 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <KbdGroup>
                <Kbd aria-label="Up arrow" className={KEYCAP}>
                  <MoveUpKeyIcon />
                </Kbd>
                <Kbd aria-label="Down arrow" className={KEYCAP}>
                  <MoveDownKeyIcon />
                </Kbd>
              </KbdGroup>
              Move
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd aria-label="Enter" className={KEYCAP}>
                <InsertKeyIcon />
              </Kbd>
              Insert
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd className={KEYCAP}>Esc</Kbd>
              Close
            </span>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------------- DOM -- */

function createChip(name: string, className: string): HTMLSpanElement {
  const chip = document.createElement("span")
  chip.textContent = name
  chip.dataset.variable = name
  chip.contentEditable = "false"
  /* A variable name is Latin text; isolated, it does not reorder the Arabic
     around it. */
  chip.dir = "ltr"
  chip.className = className
  return chip
}

/** Fill the field from the stored string, one chip per token. */
function paint(
  el: HTMLElement,
  value: string,
  classFor: (name: string) => string,
) {
  const fragment = document.createDocumentFragment()
  let last = 0

  for (const match of value.matchAll(TOKEN)) {
    const index = match.index ?? 0
    const name = match[1] ?? ""
    if (index > last) fragment.append(value.slice(last, index))
    fragment.append(createChip(name, classFor(name)))
    last = index + match[0].length
  }
  if (last < value.length) fragment.append(value.slice(last))

  el.replaceChildren(fragment)
}

/** Read the field back into the stored string. */
function serialize(container: Node): string {
  let out = ""

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.nodeValue ?? ""
      return
    }
    if (!(node instanceof HTMLElement)) return

    if (node.dataset.variable) {
      out += `{{${node.dataset.variable}}}`
      return
    }
    if (node.tagName === "BR") {
      out += "\n"
      return
    }
    /* Pasted rich text arrives as blocks; each one is a line. */
    const block = node.tagName === "DIV" || node.tagName === "P"
    if (block && out.length > 0 && !out.endsWith("\n")) out += "\n"
    node.childNodes.forEach(walk)
  }

  container.childNodes.forEach(walk)
  return out
}

/** Does any text outside a chip still read `{{name}}`? */
function hasTypedToken(el: HTMLElement): boolean {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const single = new RegExp(TOKEN.source)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement?.closest("[data-variable]")) continue
    if (single.test(node.nodeValue ?? "")) return true
  }
  return false
}

/** Where the caret is, as an offset into the stored string. */
function caretOffset(el: HTMLElement): number | null {
  const selection = window.getSelection()
  const anchor = selection?.anchorNode
  if (!selection || !anchor || !el.contains(anchor)) return null

  const range = document.createRange()
  range.setStart(el, 0)
  range.setEnd(anchor, selection.anchorOffset)
  return serialize(range.cloneContents()).length
}

/** Put the caret at an offset into the stored string. */
function placeCaret(el: HTMLElement, offset: number) {
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  let remaining = offset
  let placed = false

  const walk = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.nodeValue?.length ?? 0
      if (remaining <= length) {
        range.setStart(node, remaining)
        return true
      }
      remaining -= length
      return false
    }
    if (!(node instanceof HTMLElement)) return false

    if (node.dataset.variable) {
      const length = node.dataset.variable.length + 4
      if (remaining <= length) {
        range.setStartAfter(node)
        return true
      }
      remaining -= length
      return false
    }
    if (node.tagName === "BR") {
      if (remaining <= 1) {
        range.setStartAfter(node)
        return true
      }
      remaining -= 1
      return false
    }

    for (const child of Array.from(node.childNodes)) {
      if (walk(child)) return true
    }
    return false
  }

  placed = walk(el)
  if (!placed) {
    range.selectNodeContents(el)
    range.collapse(false)
  }
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

/** A range's box in the coordinates of the field, for the anchors. */
function relativeBox(range: Range, el: HTMLElement): Box {
  const rect = range.getBoundingClientRect()
  const base = el.getBoundingClientRect()
  return {
    height: rect.height,
    left: rect.left - base.left,
    top: rect.top - base.top,
    width: rect.width,
  }
}
