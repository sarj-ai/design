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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  KNOWLEDGE_BASE,
  SOURCE_LABELS,
  pendingSource,
  type Source,
  type SourceKind,
} from "@/lib/knowledge-base-data"
import { AppShell } from "@/components/app-shell"
import {
  AddSourceDialog,
  AddSources,
  type AddKind,
} from "@/components/knowledge-base/add-sources"
import { SourceTable } from "@/components/knowledge-base/source-table"
import { SummaryField } from "@/components/knowledge-base/summary-field"
import { KnowledgeIcon, SearchIcon } from "@/components/knowledge-base/icons"

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

  const filePicker = React.useRef<HTMLInputElement>(null)

  const visible = sources.filter(
    (source) =>
      (kind === "all" || source.kind === kind) &&
      `${source.name} ${source.url ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )

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
    <AppShell active="Knowledge Bases" breadcrumb={["Knowledge Bases", base.name]}>
      <div className="flex flex-col gap-6 p-3 lg:p-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{base.name}</h1>
        <p className="text-sm text-muted-foreground">
          Last updated {base.updatedAt} by {base.updatedBy}
        </p>
      </header>

      {/* On a card, like everything else on the page — it was the one band
          sitting bare on the background. */}
      <Card>
        <CardContent>
          <SummaryField value={base.summary} />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-medium">Content</h2>

        <AddSources onOpen={openAdd} />

        {/* The browser's own picker. Never shown — the cards above are the
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

        {sources.length ? (
          /* `--card-spacing: 0` is how Card is told its content reaches the
             edge — the table draws its own header band and row rules. The
             filter row sits inside the same card, above them, on its own
             border so it reads as this table's controls. */
          <Card className="[--card-spacing:0px]">
            <div className="flex flex-wrap items-center gap-3 border-b p-4">
              <InputGroup className="max-w-80">
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

              <Select
                value={kind}
                onValueChange={(next) => setKind(next as SourceKind | "all")}
              >
                <SelectTrigger className="w-40" aria-label="Filter by type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {(Object.keys(SOURCE_LABELS) as SourceKind[]).map((item) => (
                    <SelectItem key={item} value={item}>
                      {SOURCE_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          <Card>
            <CardContent>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <KnowledgeIcon />
                  </EmptyMedia>
                  <EmptyTitle>Nothing in here yet</EmptyTitle>
                  <EmptyDescription>
                    Add a file, a page address, or type something in. Until then
                    the agent has nothing to look up and won&apos;t call this
                    knowledge base.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        )}
      </section>

      <AddSourceDialog
        kind={dialog}
        onOpenChange={(open) => setDialog(open ? dialog : null)}
        onAdd={addTyped}
      />
      </div>
    </AppShell>
  )
}
