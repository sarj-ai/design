"use client";

import * as React from "react";
import { toast } from "sonner";

import { SecondaryTabs } from "@/components/design-system/tabs-preview";
import {
  ConfigurationTabIcon,
  ConfigureIcon,
  CreatedIcon,
  ScenarioTabIcon,
  ScheduleTabIcon,
} from "@/components/mockups/scenario-advanced-settings/icons";
import {
  SettingsDrawer,
  type DrawerTarget,
} from "@/components/mockups/scenario-advanced-settings/settings-drawer";
import { SaveBar } from "@/components/shared/save-bar";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  GROUPS,
  PROMPT_SECTIONS,
  SAVED,
  SCENARIO,
  TOOLS,
  changedIn,
  countChanges,
  groupSummary,
  type Draft,
  type GroupId,
} from "@/lib/mockups/scenario-advanced-settings-data";

const TABS = [
  { id: "configuration", label: "Configuration", Icon: ConfigurationTabIcon },
  { id: "scenario", label: "Scenario", Icon: ScenarioTabIcon },
  { id: "schedule", label: "Schedule configuration", Icon: ScheduleTabIcon },
] as const;

type Tab = (typeof TABS)[number]["id"];
const ACCESS_LEVELS = ["override", "view"] as const;

type Access = (typeof ACCESS_LEVELS)[number];

export default function ScenarioAdvancedSettingsPage() {
  const [access, setAccess] = React.useState<Access>("override");
  const [tab, setTab] = React.useState<Tab>("configuration");
  const [saved, setSaved] = React.useState<Draft>(SAVED);
  const [draft, setDraft] = React.useState<Draft>(SAVED);
  const [target, setTarget] = React.useState<DrawerTarget>(null);

  const changes = countChanges(saved, draft);
  const openGroup = (id: GroupId) =>
    setTarget({ kind: "group", group: GROUPS[id] });

  function save() {
    setSaved(draft);
    toast.success("Scenario saved", {
      description: "The next call uses these settings.",
    });
  }

  function discard() {
    const before = draft;
    setDraft(saved);
    toast("Changes discarded", {
      action: { label: "Undo", onClick: () => setDraft(before) },
    });
  }

  const sectionsOn = PROMPT_SECTIONS.length - draft.excluded.length;

  return (
    <MockupShell
      actions={
        <ToggleGroup
          aria-label="Editor's permissions"
          size="sm"
          type="single"
          value={access}
          variant="outline"
          onValueChange={(next) => {
            const level = ACCESS_LEVELS.find((entry) => entry === next);
            if (level) setAccess(level);
          }}
        >
          <ToggleGroupItem value="override">
            Can override advanced
          </ToggleGroupItem>
          <ToggleGroupItem value="view">Can view advanced</ToggleGroupItem>
        </ToggleGroup>
      }
      title="Scenario advanced settings"
    >
      <AppShell active="Scenarios" breadcrumb={["Scenarios", SCENARIO.name]}>
        <main className="mx-auto flex min-h-full w-full max-w-350 flex-col gap-6 p-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">{SCENARIO.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge className="bg-success-tint text-success-tint-foreground">
                {SCENARIO.status}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground [&_svg]:size-4">
                <CreatedIcon />
                Created {SCENARIO.createdAt}
              </span>
            </div>
          </header>

          <SecondaryTabs
            items={TABS.map((entry) => ({
              id: entry.id,
              Icon: entry.Icon,
              label: entry.label,
            }))}
            value={tab}
            onValueChange={(next) => {
              const entry = TABS.find((candidate) => candidate.id === next);
              if (entry) setTab(entry.id);
            }}
          >
            <TabsContent
              className="flex flex-col gap-6 pt-2"
              value="configuration"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge bases</CardTitle>
                  <CardDescription>
                    Clinic FAQ · Insurance partners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ItemGroup className="gap-2">
                    <GroupRow
                      id="knowledge"
                      draft={draft}
                      title={GROUPS.knowledge.title}
                      onOpen={openGroup}
                    />
                  </ItemGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tools</CardTitle>
                  <CardDescription>
                    Tools the agent can use during the call.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ItemGroup className="gap-2">
                    {TOOLS.map((tool) =>
                      tool.group ? (
                        <GroupRow
                          key={tool.slug}
                          id={tool.group}
                          draft={draft}
                          title={tool.label}
                          detail={tool.summary}
                          onOpen={openGroup}
                        />
                      ) : (
                        <Item key={tool.slug} size="sm" variant="outline">
                          <ItemContent>
                            <ItemTitle>{tool.label}</ItemTitle>
                            <ItemDescription>{tool.summary}</ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <Button
                              aria-label={`Configure ${tool.label}`}
                              size="icon-sm"
                              variant="ghost"
                              onClick={() =>
                                toast("Unchanged in this design", {
                                  description: `${tool.label} has no hard-coded values to expose.`,
                                })
                              }
                            >
                              <ConfigureIcon />
                            </Button>
                          </ItemActions>
                        </Item>
                      ),
                    )}
                    <GroupRow
                      id="cues"
                      draft={draft}
                      title={GROUPS.cues.title}
                      onOpen={openGroup}
                    />
                  </ItemGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Global prompt</CardTitle>
                  <CardDescription>
                    Shared instructions every scenario gets, by language.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ItemGroup className="gap-2">
                    <Item size="sm" variant="outline">
                      <ItemContent>
                        <ItemTitle>Sections</ItemTitle>
                        <ItemDescription>
                          {sectionsOn === PROMPT_SECTIONS.length
                            ? `All ${String(PROMPT_SECTIONS.length)} sections on`
                            : `${String(sectionsOn)} of ${String(PROMPT_SECTIONS.length)} sections on`}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        {draft.excluded.length > 0 ? (
                          <Badge variant="secondary">
                            {draft.excluded.length} off
                          </Badge>
                        ) : null}
                        <Button
                          aria-label="Configure global prompt sections"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => setTarget({ kind: "prompt" })}
                        >
                          <ConfigureIcon />
                        </Button>
                      </ItemActions>
                    </Item>
                  </ItemGroup>
                </CardContent>
              </Card>
            </TabsContent>

            {TABS.filter((entry) => entry.id !== "configuration").map(
              (entry) => (
                <TabsContent className="pt-2" key={entry.id} value={entry.id}>
                  <p className="text-sm text-muted-foreground">
                    Unchanged in this design.
                  </p>
                </TabsContent>
              ),
            )}
          </SecondaryTabs>

          <SaveBar changes={changes} onDiscard={discard} onSave={save} />
        </main>
      </AppShell>

      <SettingsDrawer
        canOverride={access === "override"}
        draft={draft}
        target={target}
        onApply={(next) => {
          setDraft(next);
          setTarget(null);
        }}
        onClose={() => setTarget(null)}
      />
    </MockupShell>
  );
}

function GroupRow({
  id,
  title,
  detail,
  draft,
  onOpen,
}: {
  id: GroupId;
  title: string;
  detail?: string;
  draft: Draft;
  onOpen: (id: GroupId) => void;
}) {
  const changed = changedIn(GROUPS[id], draft.overrides);
  const summary = groupSummary(id, draft.overrides);

  return (
    <Item size="sm" variant="outline">
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>
          {detail ? `${detail} · ${summary}` : summary}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {changed > 0 ? (
          <Badge variant="secondary">
            {changed === 1 ? "1 changed" : `${String(changed)} changed`}
          </Badge>
        ) : null}
        <Button
          aria-label={`Configure ${title}`}
          size="icon-sm"
          variant="ghost"
          onClick={() => onOpen(id)}
        >
          <ConfigureIcon />
        </Button>
      </ItemActions>
    </Item>
  );
}
