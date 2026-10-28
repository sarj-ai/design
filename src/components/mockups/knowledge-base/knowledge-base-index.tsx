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
import {
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
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
} from "@/lib/mockups/knowledge-base-data"
import { AppShell } from "@/components/shell/app-shell"
import { ActionTile, PageHeader } from "@/components/shared/page-header"
import { NewKnowledgeBaseDialog } from "@/components/mockups/knowledge-base/new-knowledge-base-dialog"
import {
  NewKnowledgeBaseIcon,
  RowMenuIcon,
  SearchIcon,
} from "@/components/mockups/knowledge-base/icons"

export function KnowledgeBaseIndex({
  initialRowMenu = false,
  initialCreate = false,
}: {
  initialRowMenu?: boolean
  initialCreate?: boolean
}) {
  const [bases, setBases] = React.useState(KNOWLEDGE_BASES)
  const [creating, setCreating] = React.useState(initialCreate)
  const [deleting, setDeleting] = React.useState<KnowledgeBaseRow | null>(null)

  return (
    <AppShell active="Knowledge Bases">
      <div className="flex flex-col gap-6 p-3 lg:p-4">
        <PageHeader
          title="Knowledge Bases"
          actions={
            <ActionTile
              icon={<NewKnowledgeBaseIcon />}
              label="New knowledge base"
              onClick={() => setCreating(true)}
            />
          }
        />

        <section className="flex flex-col gap-4">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search knowledge bases..."
              aria-label="Search knowledge bases"
            />
          </InputGroup>

          {/* `--card-spacing: 0` runs the table to the card's edge. */}
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
                            /* The link's ::after covers the row. Keep it a real link so focus and open-in-new-tab work. */
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

                      {/* Raised above the row's link overlay so the menu stays clickable. */}
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
