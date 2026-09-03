"use client"

import {
  ReferenceLabel,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Tabs, and the three things that get mistaken for them.
 *
 * The rule is one object seen several ways. Everything that goes wrong with
 * tabs is a different relationship wearing them: steps are a sequence and the
 * reader cannot skip one, separate objects are separate routes and need their
 * own URL, and a single setting is a drawer beside the thing it belongs to.
 * All three are patterns on this tab already, which is why the alternatives
 * name them rather than describing them.
 *
 * The example is one call — the same call in all three panels. If the panels
 * could be about different calls it was never tabs.
 */

const VIEWS = [
  {
    id: "transcript",
    label: "Transcript",
    body: "Agent · Your balance is 412 riyals.\nCaller · When is it due?",
  },
  {
    id: "model",
    label: "Model",
    body: "gpt-4o-mini · 1,284 tokens in, 310 out.",
  },
  { id: "cost", label: "Cost", body: "$0.41 · 3:44 at $0.11 a minute." },
]

const INSTEAD = [
  {
    when: "Several views of one object",
    surface: "Tabs",
    why: "The object does not change as the reader moves between them.",
  },
  {
    when: "Steps toward making one object",
    surface: "Multi-step creation",
    why: "A sequence. The reader cannot skip one, and tabs imply they can.",
  },
  {
    when: "A different object",
    surface: "A route of its own",
    why: "It needs a URL someone can send. A tab has no address.",
  },
  {
    when: "One setting on the object",
    surface: "Drawer",
    why: "You still need the page behind it while you change it.",
  },
]

export function TabsPreview() {
  return (
    <div className="flex flex-col gap-6">
      <Tabs className="gap-4" defaultValue="transcript">
        {/* The object is named once, above the tabs rather than inside each
            panel. Repeated per panel it would suggest the panels might be
            about different calls, which is the one thing tabs must not say. */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">CL-8842</span>
          <Badge variant="secondary">Rawabi Holding</Badge>
        </div>

        <TabsList>
          {VIEWS.map((view) => (
            <TabsTrigger key={view.id} value={view.id}>
              {view.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {VIEWS.map((view) => (
          <TabsContent
            className="flex flex-col gap-2"
            key={view.id}
            value={view.id}
          >
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {view.body}
            </p>
          </TabsContent>
        ))}
      </Tabs>

      <ReferenceTable
        columns={[
          { header: "What you have", width: "w-72" },
          { header: "Reach for", width: "w-56" },
          { header: "Why" },
        ]}
        rows={INSTEAD.map((one) => ({
          key: one.when,
          cells: [
            <ReferenceLabel key="w">{one.when}</ReferenceLabel>,
            <ReferenceLabel key="s">{one.surface}</ReferenceLabel>,
            <ReferenceNote key="y">{one.why}</ReferenceNote>,
          ],
        }))}
      />
    </div>
  )
}
