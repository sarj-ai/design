"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageChip } from "@/components/design-system/call-table";
import {
  DeletePersonaIcon,
  EditPersonaIcon,
  NewPersonaIcon,
} from "@/components/mockups/voice-ownership/icons";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table";
import { ChoiceFilter, FilterBar } from "@/components/shared/filter-bar";
import { ListFooter } from "@/components/shared/list-footer";
import { PageHeader } from "@/components/shared/page-header";
import {
  LANGUAGE_CODES,
  LANGUAGES,
  PERSONAS,
  voiceById,
  type Persona,
} from "@/lib/mockups/voice-ownership-data";

/**
 * The platform's persona list (app/agents) as it ships, plus one column:
 * Voice, with who owns it — so two personas on one voice are visible.
 */
export function PersonaList({
  onEdit,
}: {
  onEdit: (persona: Persona) => void;
}) {
  const [language, setLanguage] = React.useState<string | null>(null);
  const rows = PERSONAS.filter(
    (persona) => !language || persona.language === language,
  );

  return (
    <TooltipProvider>
      <main className="flex w-full flex-col gap-4 p-8">
        <PageHeader title="Personas" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FilterBar activeCount={language ? 1 : 0}>
            <ChoiceFilter
              field="Language"
              onChange={setLanguage}
              options={LANGUAGES.map((entry) => ({
                value: entry,
                label: entry,
              }))}
              value={language}
            />
          </FilterBar>
          <Button>
            <NewPersonaIcon />
            New persona
          </Button>
        </div>

        <DataTable>
          <TableHeader>
            <DataTableHeaderRow>
              <DataTableHead>Name</DataTableHead>
              <DataTableHead>Language</DataTableHead>
              <DataTableHead>Gender</DataTableHead>
              <DataTableHead>Voice</DataTableHead>
              <DataTableHead>Created</DataTableHead>
              <DataTableHead className="text-end">
                <span className="sr-only">Actions</span>
              </DataTableHead>
            </DataTableHeaderRow>
          </TableHeader>
          <TableBody>
            {rows.map((persona) => {
              const voice = voiceById(persona.voiceId);
              return (
                <TableRow key={persona.id}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <bdi className="font-medium">{persona.name}</bdi>
                      {persona.isDefault ? (
                        <Badge
                          className="bg-primary-tint text-primary-tint-foreground"
                          variant="secondary"
                        >
                          Default
                        </Badge>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <LanguageChip
                      languages={[LANGUAGE_CODES[persona.language]]}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {persona.gender}
                  </TableCell>
                  <TableCell>
                    {voice ? (
                      // A Sarj voice is the norm, so only the organization's own is marked.
                      <span className="flex items-center gap-2">
                        {voice.name}
                        {voice.owner === "org" ? (
                          <Badge variant="secondary">Your org</Badge>
                        ) : null}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {persona.createdAt}
                  </TableCell>
                  <TableCell className="text-end">
                    <span className="flex items-center justify-end gap-1">
                      {persona.isDefault ? null : (
                        <Button size="sm" variant="outline">
                          Set as default
                        </Button>
                      )}
                      <Button
                        aria-label={`Edit persona ${persona.name}`}
                        onClick={() => onEdit(persona)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <EditPersonaIcon />
                      </Button>
                      <Button
                        aria-label={`Delete persona ${persona.name}`}
                        disabled={persona.isDefault}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <DeletePersonaIcon />
                      </Button>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </DataTable>

        <ListFooter
          atEnd
          from={1}
          noun="personas"
          pageSize={25}
          shown={rows.length}
          total={rows.length}
        />
      </main>
    </TooltipProvider>
  );
}
