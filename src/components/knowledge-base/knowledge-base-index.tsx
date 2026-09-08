"use client"

import * as React from "react"
import Link from "next/link"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTableHead, DataTableHeaderRow } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  KNOWLEDGE_BASES,
  type KnowledgeBaseRow,
} from "@/lib/knowledge-base-data"
import { AppShell } from "@/components/app-shell"
import { NewKnowledgeBaseDialog } from "@/components/knowledge-base/new-knowledge-base-dialog"
import { RowMenuIcon, SearchIcon } from "@/components/knowledge-base/icons"

/**
 * The index, which already exists. The one change is that a knowledge base is
 * now made of documents, so a row can say how much is in it.
 *
 * The whole row opens the knowledge base, so the only row control left is the
 * menu — a view and an edit button beside it did the same thing twice over.
 */
export function KnowledgeBaseIndex({
  initialRowMenu = false,
  initialCreate = false,
}: {
  /** Opens the first row's menu, for reviewing and exporting that state. */
  initialRowMenu?: boolean
  /** Opens with the create dialog already showing, for reviewing that state. */
  initialCreate?: boolean
}) {
  const [bases, setBases] = React.useState(KNOWLEDGE_BASES)
  const [creating, setCreating] = React.useState(initialCreate)
  const [deleting, setDeleting] = React.useState<KnowledgeBaseRow | null>(null)

  return (
    <AppShell active="Knowledge Bases">
      <div className="flex flex-col gap-6 p-3 lg:p-4">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Knowledge Bases</h1>
          <Button onClick={() => setCreating(true)}>New Knowledge Base</Button>
        </header>

        {/* Search sits outside the card rather than in a band inside it. It is
          one control over one table, so the card can hold only the table, and
          the gap here is tighter than the page's own so the two still read as
          one thing. */}
        <section className="flex flex-col gap-4">
          <InputGroup className="max-w-80">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search knowledge bases..."
              aria-label="Search knowledge bases"
            />
          </InputGroup>

          {/* `--card-spacing: 0` is how Card is told its content reaches the
            edge — the table draws its own header band and row rules, so the
            card's usual 16px inset would show as a strip above the header
            instead of framing it. */}
          <Card className="[--card-spacing:0px]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <DataTableHeaderRow>
                    <DataTableHead>Name</DataTableHead>
                    <DataTableHead>Created</DataTableHead>
                    <DataTableHead>Last updated</DataTableHead>
                    <DataTableHead>Updated by</DataTableHead>
                    <TableHead className="w-16" />
                  </DataTableHeaderRow>
                </TableHeader>

                <TableBody>
                  {bases.map((base, index) => (
                    <TableRow
                      key={base.id}
                      className="relative cursor-pointer transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none"
                    >
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <Link
                            href="/knowledge-base/detail"
                            /* The ::after covers the whole row, so anywhere on it
                         opens this knowledge base. Still one real link, so
                         focus, middle-click and open-in-new-tab keep working
                         — which a click handler on the row would break. */
                            className="font-medium after:absolute after:inset-0"
                          >
                            {base.name}
                          </Link>
                          <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {base.documents
                              ? `${base.documents} documents`
                              : "Nothing in it yet"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {base.created}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {base.updatedAt}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {base.updatedBy}
                      </TableCell>

                      {/* Raised above the row's link overlay so the menu stays
                    clickable. */}
                      <TableCell>
                        <div className="relative z-raised flex items-center justify-end">
                          <DropdownMenu
                            defaultOpen={initialRowMenu && index === 0}
                            modal={false}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`More actions for ${base.name}`}
                              >
                                <RowMenuIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleting(base)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </section>

        <NewKnowledgeBaseDialog open={creating} onOpenChange={setCreating} />

        {/* Deleting takes the documents with it, and the agents pointed at it
          lose what they were looking things up in — so it asks first. */}
        <AlertDialog
          open={deleting !== null}
          onOpenChange={(open) => {
            if (!open) setDeleting(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Everything in it is deleted with it, and any agent using it
                stops being able to look anything up. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (!deleting) return
                  setBases((current) =>
                    current.filter((base) => base.id !== deleting.id),
                  )
                  setDeleting(null)
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  )
}
