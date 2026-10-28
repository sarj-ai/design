"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  CopiedIcon,
  CopyJsonIcon,
  FoldIcon,
} from "@/components/design-system/icons"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }
type Container = Json[] | { [key: string]: Json }

const ENGLISH: Json = {
  agentName: "Sara",
  allowInterruptions: true,
  backChannel: { type: "word", value: 0.6, whitelist: ["I see", "ok"] },
  maxDurationEndCallMessage: null,
  models: {
    fallback: {
      models: [
        { model: "long", provider: "google", region: "eu" },
        { model: "gpt-4o-transcribe", provider: "openai" },
      ],
      type: "enable",
    },
    llm: {
      model: "flash-lite-3.1",
      provider: "gemini",
      region: "europe-west3",
    },
    stt: { provider: "aws", region: "eu-central-1" },
    tts: {
      arabicVoiceId: "DJR3iLTFoK76RjR7KFUy",
      model: "eleven_flash_v2_5",
      provider: "11labs",
      speed: 1,
    },
  },
  voice: { createdAt: "2025-12-10T19:11:38.607826Z", displayName: "Sara" },
}

const ARABIC: Json = {
  agentName: "عبدالله",
  allowInterruptions: true,
  backChannel: { type: "word", value: 0.6, whitelist: ["حاضر", "طيب", "تمام"] },
  maxDurationEndCallMessage: null,
  models: {
    fallback: {
      models: [
        { model: "long", provider: "google", region: "eu" },
        { provider: "azure", region: "germanywestcentral" },
      ],
      type: "enable",
    },
    llm: {
      model: "flash-lite-3.1",
      provider: "gemini",
      region: "europe-west3",
    },
    stt: { provider: "aws", region: "eu-central-1" },
    tts: { provider: "groq", voice: "abdullah" },
  },
  voice: { createdAt: "2026-04-12T10:35:46.739089Z", displayName: "Abdullah" },
}

type Side = { label: string; code: string; value: Json }

const LEFT: Side = { label: "English", code: "en", value: ENGLISH }
const RIGHT: Side = { label: "Arabic", code: "ar", value: ARABIC }

const VIEWS = [
  { id: "unified", label: "Unified" },
  { id: "table", label: "Table" },
  { id: "side-by-side", label: "Side by side" },
  { id: "single", label: "Single" },
]

export function JsonViewPreview() {
  const [view, setView] = React.useState("unified")
  const [only, setOnly] = React.useState(false)
  const compare = { left: LEFT, right: RIGHT, only }

  return (
    <SecondaryTabs items={VIEWS} onValueChange={setView} value={view}>
      <TabsContent value="unified">
        <CompareBar onOnly={setOnly} only={only}>
          <JsonUnified {...compare} />
        </CompareBar>
      </TabsContent>
      <TabsContent value="table">
        <CompareBar onOnly={setOnly} only={only}>
          <JsonTable {...compare} />
        </CompareBar>
      </TabsContent>
      <TabsContent value="side-by-side">
        <CompareBar onOnly={setOnly} only={only}>
          <JsonSideBySide {...compare} />
        </CompareBar>
      </TabsContent>
      <TabsContent value="single">
        <JsonView value={ENGLISH} />
      </TabsContent>
    </SecondaryTabs>
  )
}

const INLINE_MAX = 48

function isContainer(value: Json | undefined): value is Container {
  return typeof value === "object" && value !== null
}

function isBranch(value: Json | undefined): value is Container {
  return (
    isContainer(value) &&
    !(
      Array.isArray(value) &&
      value.every((item) => !isContainer(item)) &&
      JSON.stringify(value).length <= INLINE_MAX
    )
  )
}

function members(value: Container): [string, Json][] {
  return Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value)
}

function same(a: Json | undefined, b: Json | undefined) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function brackets(value: Container) {
  return Array.isArray(value) ? (["[", "]"] as const) : (["{", "}"] as const)
}

function union(a: Container, b: Container) {
  const left = new Map(members(a))
  const right = new Map(members(b))
  return {
    keys: [...new Set([...left.keys(), ...right.keys()])],
    left,
    right,
  }
}

function countDifferences(a: Json | undefined, b: Json | undefined): number {
  if (isBranch(a) && isBranch(b) && Array.isArray(a) === Array.isArray(b)) {
    const { keys, left, right } = union(a, b)
    return keys.reduce(
      (sum, key) => sum + countDifferences(left.get(key), right.get(key)),
      0,
    )
  }
  return same(a, b) ? 0 : 1
}

type Line = {
  id: string
  path: string
  depth: number
  label?: string
  kind: "open" | "close" | "leaf" | "folded"
  value?: Json
  bracket?: string
  count?: number
  comma: boolean
  side?: "left" | "right"
}

function folded(
  value: Container,
  path: string,
  depth: number,
  label: string | undefined,
  comma: boolean,
): Line {
  return {
    id: path,
    path,
    depth,
    label,
    kind: "folded",
    bracket: brackets(value)[0],
    count: members(value).length,
    comma,
  }
}

function toLines(
  value: Json,
  folds: Set<string>,
  path = "$",
  depth = 0,
  label?: string,
  comma = false,
): Line[] {
  if (!isBranch(value)) {
    return [{ id: path, path, depth, label, kind: "leaf", value, comma }]
  }
  if (folds.has(path)) return [folded(value, path, depth, label, comma)]

  const [open, close] = brackets(value)
  const list = members(value)
  return [
    { id: path, path, depth, label, kind: "open", bracket: open, comma: false },
    ...list.flatMap(([key, item], index) =>
      toLines(
        item,
        folds,
        `${path}.${key}`,
        depth + 1,
        Array.isArray(value) ? undefined : key,
        index < list.length - 1,
      ),
    ),
    { id: `${path}:close`, path, depth, kind: "close", bracket: close, comma },
  ]
}

type CompareOptions = { folds: Set<string>; only: boolean }

function toUnified(
  a: Json | undefined,
  b: Json | undefined,
  options: CompareOptions,
  path = "$",
  depth = 0,
  label?: string,
  comma = false,
): Line[] {
  const identical = same(a, b)

  if (isBranch(a) && isBranch(b) && Array.isArray(a) === Array.isArray(b)) {
    if (options.folds.has(path) || (options.only && identical)) {
      return [folded(a, path, depth, label, comma)]
    }
    const [open, close] = brackets(a)
    const { keys, left, right } = union(a, b)
    return [
      {
        id: path,
        path,
        depth,
        label,
        kind: "open",
        bracket: open,
        comma: false,
      },
      ...keys.flatMap((key, index) =>
        toUnified(
          left.get(key),
          right.get(key),
          options,
          `${path}.${key}`,
          depth + 1,
          Array.isArray(a) ? undefined : key,
          index < keys.length - 1,
        ),
      ),
      {
        id: `${path}:close`,
        path,
        depth,
        kind: "close",
        bracket: close,
        comma,
      },
    ]
  }

  if (identical) {
    return options.only
      ? []
      : [{ id: path, path, depth, label, kind: "leaf", value: a, comma }]
  }

  const one = (value: Json, side: "left" | "right"): Line => ({
    ...(isBranch(value)
      ? folded(value, path, depth, label, comma)
      : { id: path, path, depth, label, kind: "leaf" as const, value, comma }),
    id: `${path}@${side}`,
    side,
  })
  return [
    ...(a === undefined ? [] : [one(a, "left")]),
    ...(b === undefined ? [] : [one(b, "right")]),
  ]
}

type Row = {
  id: string
  left: Line | null
  right: Line | null
  differs: boolean
}

function toRows(
  a: Json | undefined,
  b: Json | undefined,
  options: CompareOptions,
): Row[] {
  return toUnified(a, b, options).reduce<Row[]>((rows, line) => {
    if (!line.side) {
      rows.push({ id: line.id, left: line, right: line, differs: false })
      return rows
    }
    /* The right half of a differing value joins the row its left half opened, so the two sit level. */
    const last = rows[rows.length - 1]
    if (line.side === "right" && last?.id === `${line.path}@left`) {
      last.right = line
      return rows
    }
    rows.push({
      id: line.id,
      left: line.side === "left" ? line : null,
      right: line.side === "right" ? line : null,
      differs: true,
    })
    return rows
  }, [])
}

function childPath(prefix: string, key: string, inArray: boolean) {
  if (inArray) return `${prefix}[${key}]`
  return prefix ? `${prefix}.${key}` : key
}

function flatten(value: Json, prefix = "", out = new Map<string, Json>()) {
  if (!isBranch(value)) {
    out.set(prefix, value)
    return out
  }
  for (const [key, item] of members(value)) {
    flatten(item, childPath(prefix, key, Array.isArray(value)), out)
  }
  return out
}

type TableRowData = { path: string; a: Json | undefined; b: Json | undefined }

function pairLeaves(
  a: Json | undefined,
  b: Json | undefined,
  prefix = "",
): TableRowData[] {
  if (isBranch(a) && isBranch(b) && Array.isArray(a) === Array.isArray(b)) {
    const { keys, left, right } = union(a, b)
    return keys.flatMap((key) =>
      pairLeaves(
        left.get(key),
        right.get(key),
        childPath(prefix, key, Array.isArray(a)),
      ),
    )
  }
  if (!isBranch(a) && !isBranch(b)) return [{ path: prefix, a, b }]

  const from = a === undefined ? new Map<string, Json>() : flatten(a, prefix)
  const to = b === undefined ? new Map<string, Json>() : flatten(b, prefix)
  return [...new Set([...from.keys(), ...to.keys()])].map((path) => ({
    path,
    a: from.get(path),
    b: to.get(path),
  }))
}

function useFolds() {
  const [folds, setFolds] = React.useState<Set<string>>(() => new Set())
  const toggle = (path: string) =>
    setFolds((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  return { folds, toggle }
}

function useCopy() {
  const [copied, setCopied] = React.useState<string | null>(null)
  const copy = async (id: string, value: Json) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
      setCopied(id)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      toast.error("Could not copy — select the text instead")
    }
  }
  return { copied, copy }
}

function Value({ value }: { value: Json | undefined }) {
  if (typeof value === "string") return <bdi>&quot;{value}&quot;</bdi>
  if (Array.isArray(value)) {
    return (
      <>
        [
        {value.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 ? ", " : null}
            <Value value={item} />
          </React.Fragment>
        ))}
        ]
      </>
    )
  }
  return <>{String(value)}</>
}

function Code({ line, muted = false }: { line: Line; muted?: boolean }) {
  return (
    <span
      className="min-w-0 truncate whitespace-pre text-muted-foreground"
      /* Two characters a level, as JSON.stringify indents. */
      style={{ paddingInlineStart: `${line.depth * 2}ch` }}
    >
      {line.label !== undefined && line.kind !== "close" ? (
        <>&quot;{line.label}&quot;: </>
      ) : null}
      {line.kind === "leaf" ? (
        <span className={muted ? undefined : "text-foreground"}>
          <Value value={line.value} />
        </span>
      ) : line.kind === "folded" ? (
        <>
          {line.bracket}
          <span className="mx-1 rounded-sm bg-muted px-1">
            {line.count} {line.bracket === "[" ? "items" : "keys"}
          </span>
          {line.bracket === "[" ? "]" : "}"}
        </>
      ) : (
        line.bracket
      )}
      {line.comma ? "," : null}
    </span>
  )
}

function Fold({
  line,
  onToggle,
}: {
  line: Line | null
  onToggle: (path: string) => void
}) {
  if (!line || line.side || (line.kind !== "open" && line.kind !== "folded")) {
    return <span aria-hidden className="w-6 shrink-0" />
  }
  const open = line.kind === "open"
  return (
    <Button
      aria-label={`${open ? "Fold" : "Unfold"} ${line.label ?? "value"}`}
      className="-my-1 shrink-0 text-muted-foreground"
      onClick={() => onToggle(line.path)}
      size="icon-xs"
      variant="ghost"
    >
      <span
        className={cn(
          "transition-transform duration-150 ease-out-cubic motion-reduce:transition-none",
          open && "rotate-90",
        )}
      >
        <FoldIcon />
      </span>
    </Button>
  )
}

function CopyButton({
  copied,
  label,
  onCopy,
}: {
  copied: boolean
  label: string
  onCopy: () => void
}) {
  return (
    <Button
      aria-label={copied ? "Copied" : label}
      onClick={onCopy}
      size="icon-sm"
      variant="ghost"
    >
      {copied ? <CopiedIcon /> : <CopyJsonIcon />}
    </Button>
  )
}

function CompareBar({
  children,
  only,
  onOnly,
}: {
  children: React.ReactNode
  only: boolean
  onOnly: (value: boolean) => void
}) {
  const differences = countDifferences(LEFT.value, RIGHT.value)
  const id = React.useId()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {differences === 0
            ? "No differences"
            : `${differences} ${differences === 1 ? "difference" : "differences"}`}
        </span>
        <div className="flex items-center gap-2">
          <Switch checked={only} id={id} onCheckedChange={onOnly} />
          <Label htmlFor={id}>Only differences</Label>
        </div>
      </div>
      {children}
    </div>
  )
}

const BLOCK = "relative overflow-hidden rounded-lg border"
const CODE = "flex flex-col py-3 font-mono text-xs leading-relaxed"

export function JsonView({ value }: { value: Json }) {
  const { folds, toggle } = useFolds()
  const { copied, copy } = useCopy()
  const lines = toLines(value, folds)

  /* Line numbers are the unfolded ones: folding skips numbers rather than renumbering. */
  const numbers = React.useMemo(
    () =>
      new Map(
        toLines(value, new Set()).map((line, index) => [line.id, index + 1]),
      ),
    [value],
  )

  return (
    <div className={BLOCK}>
      <div className={cn(CODE, "pe-12")}>
        {lines.map((line) => (
          <div className="flex items-center" key={line.id}>
            <span className="w-10 shrink-0 pe-2 text-end text-muted-foreground/60 tabular-nums select-none">
              {numbers.get(line.id)}
            </span>
            <Fold line={line} onToggle={toggle} />
            <Code line={line} />
          </div>
        ))}
      </div>
      <div className="absolute end-2 top-2">
        <CopyButton
          copied={copied === "value"}
          label="Copy JSON"
          onCopy={() => void copy("value", value)}
        />
      </div>
    </div>
  )
}

type CompareProps = { left: Side; right: Side; only: boolean }

function JsonUnified({ left, right, only }: CompareProps) {
  const { folds, toggle } = useFolds()
  const lines = toUnified(left.value, right.value, { folds, only })

  return (
    <div className={BLOCK}>
      <div className={CODE}>
        {lines.map((line) => (
          <div
            className={cn(
              "flex items-center ps-2 pe-4",
              line.side && "bg-muted/60",
            )}
            key={line.id}
          >
            <Fold line={line} onToggle={toggle} />
            <span className="w-6 shrink-0 text-muted-foreground select-none">
              {line.side === "left"
                ? left.code
                : line.side === "right"
                  ? right.code
                  : null}
            </span>
            <Code line={line} muted={!line.side} />
          </div>
        ))}
      </div>
    </div>
  )
}

function JsonTable({ left, right, only }: CompareProps) {
  const a = isContainer(left.value) ? left.value : {}
  const b = isContainer(right.value) ? right.value : {}
  const { keys, left: leftTop, right: rightTop } = union(a, b)

  const keep = (rows: TableRowData[]) =>
    rows.filter((row) => !only || !same(row.a, row.b))

  const isSection = (key: string) =>
    isBranch(leftTop.get(key)) || isBranch(rightTop.get(key))
  const plainRows = keep(
    keys
      .filter((key) => !isSection(key))
      .map((key) => ({ path: key, a: leftTop.get(key), b: rightTop.get(key) })),
  )
  const sections = keys.filter(isSection).map((key) => ({
    key,
    rows: keep(pairLeaves(leftTop.get(key), rightTop.get(key))),
  }))

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table className="table-fixed font-mono text-xs">
        <TableHeader className="bg-muted/60 font-sans">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-1/3 ps-4">Key</TableHead>
            <TableHead>{left.label}</TableHead>
            <TableHead>{right.label}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plainRows.map((row) => (
            <ValueRow key={row.path} row={row} />
          ))}
          {sections.map((section) =>
            section.rows.length ? (
              <React.Fragment key={section.key}>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell
                    className="ps-4 font-medium text-foreground"
                    colSpan={3}
                  >
                    {section.key}
                  </TableCell>
                </TableRow>
                {section.rows.map((row) => (
                  <ValueRow
                    indent
                    key={`${section.key}.${row.path}`}
                    row={row}
                  />
                ))}
              </React.Fragment>
            ) : null,
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function ValueRow({
  indent = false,
  row,
}: {
  indent?: boolean
  row: TableRowData
}) {
  const cell = (value: Json | undefined) => (
    <TableCell className="truncate">
      {value === undefined ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <Value value={value} />
      )}
    </TableCell>
  )

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        className={cn(
          "truncate text-muted-foreground",
          indent ? "ps-8" : "ps-4",
        )}
      >
        {row.path}
      </TableCell>
      {same(row.a, row.b) ? (
        <TableCell className="truncate text-muted-foreground" colSpan={2}>
          <Value value={row.a} />
        </TableCell>
      ) : (
        <>
          {cell(row.a)}
          {cell(row.b)}
        </>
      )}
    </TableRow>
  )
}

function JsonSideBySide({ left, right, only }: CompareProps) {
  const { folds, toggle } = useFolds()
  const { copied, copy } = useCopy()
  const rows = toRows(left.value, right.value, { folds, only })

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-2 divide-x border-b bg-muted/60">
        {[left, right].map((side) => (
          <div
            className="flex h-10 items-center justify-between ps-4 pe-1.5 text-xs font-medium text-muted-foreground"
            key={side.label}
          >
            {side.label}
            <CopyButton
              copied={copied === side.label}
              label={`Copy ${side.label}`}
              onCopy={() => void copy(side.label, side.value)}
            />
          </div>
        ))}
      </div>

      <div className="py-2 font-mono text-xs leading-relaxed">
        {rows.map((row) => (
          <div
            className={cn(
              "grid grid-cols-2 divide-x border-s-2",
              row.differs ? "border-s-primary" : "border-s-transparent",
            )}
            key={row.id}
          >
            <div className="flex min-w-0 items-center ps-1.5 pe-3">
              <Fold line={row.left} onToggle={toggle} />
              {row.left ? <Code line={row.left} muted={!row.differs} /> : null}
            </div>
            <div className="flex min-w-0 items-center ps-4 pe-3">
              {row.right ? (
                <Code line={row.right} muted={!row.differs} />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
