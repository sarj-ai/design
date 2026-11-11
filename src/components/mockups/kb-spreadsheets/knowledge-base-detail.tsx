"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  AddFilterIcon,
  KnowledgeIcon,
  SearchIcon,
  SortIcon,
} from "@/components/mockups/kb-spreadsheets/icons";
import { SourceTable } from "@/components/mockups/kb-spreadsheets/source-table";
import {
  AddSourceDialog,
  AddSources,
  type AddKind,
} from "@/components/mockups/knowledge-base/add-sources";
import { SummaryField } from "@/components/mockups/knowledge-base/summary-field";
import { PageHeader } from "@/components/shared/page-header";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  SOURCE_KINDS,
  SOURCE_LABELS,
  SPREADSHEET_MAX_BYTES,
  isSpreadsheet,
  parsedSheet,
  pendingSource,
  type Source,
  type SourceKind,
} from "@/lib/mockups/kb-spreadsheets-data";
import { KNOWLEDGE_BASE } from "@/lib/mockups/knowledge-base-data";

export function KnowledgeBaseDetail({
  base = KNOWLEDGE_BASE,
  sources,
  setSources,
  onOpenSheet,
}: {
  base?: typeof KNOWLEDGE_BASE;
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  onOpenSheet: (id: string) => void;
}) {
  const [dialog, setDialog] = React.useState<AddKind | null>(null);
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState<SourceKind | "all">("all");
  const [creator, setCreator] = React.useState<string>("all");
  const [sort, setSort] = React.useState<SortKey>("added");

  const filePicker = React.useRef<HTMLInputElement>(null);

  const creators = [...new Set(sources.map((source) => source.addedBy))];

  const matched = sources.filter(
    (source) =>
      (kind === "all" || source.kind === kind) &&
      (creator === "all" || source.addedBy === creator) &&
      `${source.name} ${source.url ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const visible =
    sort === "title"
      ? matched.toSorted((a, b) => a.name.localeCompare(b.name))
      : matched;

  function openAdd(next: AddKind) {
    if (next === "files") {
      filePicker.current?.click();
      return;
    }
    setDialog(next);
  }

  function addTyped(
    next: AddKind,
    source: { name: string; url?: string; body?: string },
  ) {
    setSources((current) => [
      {
        id: `src-${String(current.length + 1)}-${source.name}`,
        name: source.name,
        kind: next === "url" ? "url" : "text",
        url: source.url,
        body: source.body,
        status: "ready",
        size: "—",
        addedBy: "talzamel@sarj.ai",
        addedAt: "Just now",
      },
      ...current,
    ]);
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return;

    const picked = [...files].map((file, index) =>
      pendingSource(
        `src-file-${String(Date.now())}-${String(index)}`,
        file.name,
        `${String(Math.max(1, Math.round(file.size / 1024)))} KB`,
      ),
    );
    const tooBig = picked.filter(
      (source, index) =>
        isSpreadsheet(source.kind) &&
        (files.item(index)?.size ?? 0) > SPREADSHEET_MAX_BYTES,
    );
    for (const source of tooBig) {
      toast.error(`${source.name} not added`, {
        description: "Choose a spreadsheet up to 1 MB.",
      });
    }
    const accepted = picked.filter((source) => !tooBig.includes(source));
    if (!accepted.length) return;

    setSources((current) => [...accepted, ...current]);

    window.setTimeout(() => {
      const ids = new Set(accepted.map((source) => source.id));
      setSources((current) =>
        current.map((source) =>
          ids.has(source.id) ? readySource(source) : source,
        ),
      );
    }, 1800);
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

        <Input
          ref={filePicker}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,.xlsx,.csv"
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <Card>
          <CardContent>
            <SummaryField value={base.summary} />
          </CardContent>
        </Card>

        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name..."
                aria-label="Search files by name"
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
                  onValueChange={(next) => {
                    const match = SORT_KEYS.find((item) => item === next);
                    if (match) setSort(match);
                  }}
                >
                  {SORT_KEYS.map((item) => (
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
              options={SOURCE_KINDS.map((item) => ({
                value: item,
                label: SOURCE_LABELS[item],
              }))}
              onChange={(next) =>
                setKind(SOURCE_KINDS.find((item) => item === next) ?? "all")
              }
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
          <Card className="[--card-spacing:0px]">
            <div className="overflow-x-auto">
              <SourceTable
                sources={visible}
                onOpenSheet={onOpenSheet}
                onRemove={(id) =>
                  setSources((current) =>
                    current.filter((source) => source.id !== id),
                  )
                }
              />
            </div>
          </Card>
        ) : (
          <Empty className="border border-solid bg-muted/50">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-10 border bg-background"
              >
                <KnowledgeIcon />
              </EmptyMedia>
              <EmptyTitle>
                {sources.length
                  ? query.trim()
                    ? `No files match “${query.trim()}”`
                    : "No files match these filters"
                  : "No files yet"}
              </EmptyTitle>
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
  );
}

function readySource(source: Source): Source {
  if (isSpreadsheet(source.kind)) {
    return { ...source, status: "ready", ...parsedSheet() };
  }
  return { ...source, status: "ready" };
}

type SortKey = "added" | "title";

const SORT_KEYS: readonly SortKey[] = ["added", "title"];

const SORT_LABELS: Record<SortKey, string> = {
  added: "Date added",
  title: "Title",
};

function FilterChip({
  field,
  value,
  options,
  onChange,
}: {
  field: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const chosen = options.find((option) => option.value === value);

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
  );
}
