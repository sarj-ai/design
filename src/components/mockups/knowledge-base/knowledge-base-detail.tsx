"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  KNOWLEDGE_BASE,
  SOURCE_LABELS,
  pendingSource,
  type Source,
  type SourceKind,
} from "@/lib/mockups/knowledge-base-data"
import { AppShell } from "@/components/shell/app-shell"
import { PageHeader } from "@/components/shared/page-header"
import {
  AddSourceDialog,
  AddSources,
  type AddKind,
} from "@/components/mockups/knowledge-base/add-sources"
import { SourceTable } from "@/components/mockups/knowledge-base/source-table"
import { SummaryField } from "@/components/mockups/knowledge-base/summary-field"
import {
  AddFilterIcon,
  KnowledgeIcon,
  SearchIcon,
  SortIcon,
} from "@/components/mockups/knowledge-base/icons"

/**
 * One knowledge base: what it covers, and what it is made of.
 *
 * The order is deliberate. The summary comes first because it is the only part
 * that still reaches the agent's prompt — everything under it is content the
 * agent fetches on demand and never carries.
 */
export function KnowledgeBaseDetail({
  base = KNOWLEDGE_BASE,
  initialSources,
  initialDialog = null,
}: {
  /** Which knowledge base this is — a populated one, or one just created. */
  base?: typeof KNOWLEDGE_BASE
  initialSources: Source[]
  /** Opens with the add dialog already showing, for reviewing that state. */
  initialDialog?: AddKind | null
}) {
  const [sources, setSources] = React.useState(initialSources)
  const [dialog, setDialog] = React.useState<AddKind | null>(initialDialog)
  const [query, setQuery] = React.useState("")
  const [kind, setKind] = React.useState<SourceKind | "all">("all")
  const [creator, setCreator] = React.useState<string>("all")
  const [sort, setSort] = React.useState<SortKey>("added")

  const filePicker = React.useRef<HTMLInputElement>(null)

  const creators = Array.from(new Set(sources.map((source) => source.addedBy)))

  const matched = sources.filter(
    (source) =>
      (kind === "all" || source.kind === kind) &&
      (creator === "all" || source.addedBy === creator) &&
      `${source.name} ${source.url ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )
  /* Sources are stored newest first, so "Date added" is the order they came
     in and only "Title" needs sorting. */
  const visible =
    sort === "title"
      ? [...matched].sort((a, b) => a.name.localeCompare(b.name))
      : matched

  function openAdd(next: AddKind) {
    if (next === "files") {
      filePicker.current?.click()
      return
    }
    setDialog(next)
  }

  function addTyped(
    next: AddKind,
    source: { name: string; url?: string; body?: string },
  ) {
    setSources((current) => [
      {
        id: `src-${current.length + 1}-${source.name}`,
        name: source.name,
        kind: next === "url" ? "url" : "text",
        url: source.url,
        body: source.body,
        // Neither needs extraction, so both are usable immediately.
        status: "ready",
        size: "—",
        addedBy: "talzamel@sarj.ai",
        addedAt: "Just now",
      },
      ...current,
    ])
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return

    setSources((current) => [
      ...Array.from(files).map((file, index) =>
        pendingSource(
          `src-file-${current.length + index}`,
          file.name,
          `${Math.max(1, Math.round(file.size / 1024))} KB`,
        ),
      ),
      ...current,
    ])
  }

  return (
    <AppShell
      active="Knowledge Bases"
      breadcrumb={["Knowledge Bases", base.name]}
    >
      <div className="flex flex-col gap-6 p-3 lg:p-4">
        <PageHeader
          title={base.name}
          description={`Last updated ${base.updatedAt} by ${base.updatedBy}`}
          actions={<AddSources onOpen={openAdd} />}
        />

        {/* The browser's own picker. Never shown — the Add files tile is the
          affordance; this only exists to receive the chosen files. */}
        <Input
          ref={filePicker}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ""
          }}
        />

        {/* On a card, like everything else on the page — it was the one band
          sitting bare on the background. */}
        <Card>
          <CardContent>
            <SummaryField value={base.summary} />
          </CardContent>
        </Card>

        <section className="flex flex-col gap-2">
          {/* Search runs the full width, with the sort beside it at the end of
            the same line. Filters sit under it as chips, each naming the field
            it narrows. */}
          <div className="flex items-center gap-2">
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this knowledge base..."
                aria-label="Search this knowledge base"
              />
            </InputGroup>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Sort">
                  <SortIcon />
                  {SORT_LABELS[sort]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(next) => setSort(next as SortKey)}
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((item) => (
                    <DropdownMenuRadioItem key={item} value={item}>
                      {SORT_LABELS[item]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip
              field="Type"
              value={kind}
              options={(Object.keys(SOURCE_LABELS) as SourceKind[]).map(
                (item) => ({ value: item, label: SOURCE_LABELS[item] }),
              )}
              onChange={(next) => setKind(next as SourceKind | "all")}
            />
            <FilterChip
              field="Creator"
              value={creator}
              options={creators.map((item) => ({ value: item, label: item }))}
              onChange={setCreator}
            />
          </div>
        </section>

        {visible.length ? (
          /* `--card-spacing: 0` is how Card is told its content reaches the
           edge — the table draws its own header band and row rules. */
          <Card className="[--card-spacing:0px]">
            <div className="overflow-x-auto">
              <SourceTable
                sources={visible}
                onRemove={(id) =>
                  setSources((current) =>
                    current.filter((source) => source.id !== id),
                  )
                }
              />
            </div>
          </Card>
        ) : (
          /* One panel for both empties — nothing added, and nothing matching.
           Only the line under the title changes. */
          <Empty className="border border-solid bg-muted/50">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-10 border bg-background"
              >
                <KnowledgeIcon />
              </EmptyMedia>
              <EmptyTitle>No documents found</EmptyTitle>
              <EmptyDescription>
                {sources.length
                  ? "Nothing here matches the search or filters."
                  : "You don't have any documents yet."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <AddSourceDialog
          kind={dialog}
          onOpenChange={(open) => setDialog(open ? dialog : null)}
          onAdd={addTyped}
        />
      </div>
    </AppShell>
  )
}

type SortKey = "added" | "title"

const SORT_LABELS: Record<SortKey, string> = {
  added: "Date added",
  title: "Title",
}

/**
 * A filter that names its field until it is set, then names the value —
 * "+ Type", then "Type: PDF". Choosing "All" puts it back.
 */
function FilterChip({
  field,
  value,
  options,
  onChange,
}: {
  field: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const chosen = options.find((option) => option.value === value)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="xs">
          {chosen ? (
            `${field}: ${chosen.label}`
          ) : (
            <>
              <AddFilterIcon />
              {field}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
