"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import {
  DateFilter,
  FilterBar,
  SelectFilter,
  type DateRange,
} from "@/components/shared/filter-bar"
import { ListFooter } from "@/components/shared/list-footer"
import { ActionTile, PageHeader } from "@/components/shared/page-header"
import {
  AddFilesIcon,
  AddTextIcon,
  AddUrlIcon,
  CreateFolderIcon,
  RowMenuIcon,
  SearchIcon,
  SyncDocumentsIcon,
} from "@/components/design-system/icons"

/**
 * The same index page, for a collection that is filled in several ways.
 *
 * Under the title it is the scenarios page again — search, filters, table,
 * footer — without the tabs, because this list has one view. The change is
 * how it is added to: from a URL, a file, typed text, a folder or a sync, and
 * five buttons at the end of the search row would crowd it. So the ways in
 * become a row of tiles under the title, and the search row keeps only the
 * search.
 */

type Doc = {
  id: string
  name: string
  kind: "URL" | "PDF" | "DOCX" | "Text" | "Folder"
  /** Size, page count or address — the line under the name. */
  detail: string
  createdBy: string
  updated: string
}

const DOCS: Doc[] = [
  {
    id: "k1",
    name: "Collections policy 2026",
    kind: "PDF",
    detail: "1.2 MB",
    createdBy: "talzamel",
    updated: "28 Sep 2026, 17:07",
  },
  {
    id: "k2",
    name: "Late payment fees",
    kind: "URL",
    detail: "sarj.ai/help/late-payment-fees",
    createdBy: "malmasoudi",
    updated: "28 Sep 2026, 15:20",
  },
  {
    id: "k3",
    name: "Instalment plans and hardship cases",
    kind: "DOCX",
    detail: "284 KB",
    createdBy: "malmasoudi",
    updated: "27 Sep 2026, 18:11",
  },
  {
    id: "k4",
    name: "Escalation wording",
    kind: "Text",
    detail: "Typed in",
    createdBy: "fjanahi",
    updated: "27 Sep 2026, 18:09",
  },
  {
    id: "k5",
    name: "Branch procedures",
    kind: "Folder",
    detail: "6 documents",
    createdBy: "talzamel",
    updated: "26 Sep 2026, 11:42",
  },
  {
    id: "k6",
    name: "Payment date promises",
    kind: "Text",
    detail: "Typed in",
    createdBy: "fjanahi",
    updated: "25 Sep 2026, 16:30",
  },
]

const TODAY = new Date(2026, 8, 28)

function inRange(stamp: string, range: DateRange | undefined) {
  if (!range?.from) return true
  const at = new Date(stamp.replace(",", "")).getTime()
  const from = new Date(range.from).setHours(0, 0, 0, 0)
  const to = new Date(range.to ?? range.from).setHours(23, 59, 59, 999)
  return at >= from && at <= to
}

const TYPES = ["URL", "PDF", "DOCX", "Text", "Folder"].map((kind) => ({
  value: kind,
  label: kind,
}))

const CREATORS = Array.from(new Set(DOCS.map((doc) => doc.createdBy))).map(
  (name) => ({ value: name, label: name }),
)

export function KnowledgeIndexPreview() {
  const [query, setQuery] = React.useState("")
  const [types, setTypes] = React.useState<string[]>([])
  const [creators, setCreators] = React.useState<string[]>([])
  const [updated, setUpdated] = React.useState<DateRange | undefined>()

  const activeCount = [types.length, creators.length, updated?.from].filter(
    Boolean,
  ).length

  const matches = (doc: Doc) =>
    doc.name.toLowerCase().includes(query.trim().toLowerCase()) &&
    (!types.length || types.includes(doc.kind)) &&
    (!creators.length || creators.includes(doc.createdBy)) &&
    inRange(doc.updated, updated)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Knowledge base" />

      {/* The ways in, right above the search that finds what they add. */}
      <div className="mt-2 flex flex-wrap gap-3">
        <ActionTile icon={<AddUrlIcon />} label="Add URL" />
        <ActionTile icon={<AddFilesIcon />} label="Add files" />
        <ActionTile icon={<AddTextIcon />} label="Create text" />
        <ActionTile icon={<CreateFolderIcon />} label="Create folder" />
        <ActionTile icon={<SyncDocumentsIcon />} label="Sync documents" />
      </div>

      <div className="flex flex-col gap-2">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search the knowledge base"
            placeholder="Search knowledge base..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>

        <FilterBar
          activeCount={activeCount}
          onClearAll={() => {
            setTypes([])
            setCreators([])
            setUpdated(undefined)
          }}
        >
          <SelectFilter
            field="Type"
            options={TYPES}
            value={types}
            onChange={setTypes}
          />
          <SelectFilter
            field="Creator"
            options={CREATORS}
            value={creators}
            onChange={setCreators}
          />
          <DateFilter
            field="Last updated"
            value={updated}
            onChange={setUpdated}
            today={TODAY}
          />
        </FilterBar>
      </div>

      <DocList rows={DOCS.filter(matches)} />
    </div>
  )
}

function DocList({ rows }: { rows: Doc[] }) {
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(0)

  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pages - 1)
  const visible = rows.slice(current * pageSize, (current + 1) * pageSize)

  return (
    <div className="flex flex-col gap-4">
      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Name</DataTableHead>
            <DataTableHead>Type</DataTableHead>
            <DataTableHead>Created by</DataTableHead>
            <DataTableHead>Last updated</DataTableHead>
            <DataTableHead className="text-end">
              <span className="sr-only">Actions</span>
            </DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {visible.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">
                {doc.name}
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  {doc.detail}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {doc.kind}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {doc.createdBy}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {doc.updated}
              </TableCell>
              <TableCell className="py-1.5 text-end">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label={`More actions for ${doc.name}`}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <RowMenuIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <>
                      <DropdownMenuItem>Move to folder</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        Delete
                      </DropdownMenuItem>
                    </>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      <ListFooter
        from={current * pageSize + 1}
        shown={visible.length}
        total={rows.length}
        noun="documents"
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(0)
        }}
        atStart={current === 0}
        atEnd={current >= pages - 1}
        onFirst={() => setPage(0)}
        onPrevious={() => setPage(current - 1)}
        onNext={() => setPage(current + 1)}
      />
    </div>
  )
}
