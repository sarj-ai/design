"use client";

import * as React from "react";

import {
  AGENT_STATES,
  type AgentState,
} from "@/components/shared/agent-state/engine";
import {
  AgentDots,
  AgentString,
  AgentWaves,
} from "@/components/shared/agent-state/visuals";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const STYLES = [
  { id: "dots", label: "Dot matrix", Visual: AgentDots, frame: "size-32" },
  { id: "waves", label: "Waves", Visual: AgentWaves, frame: "h-32 w-full" },
  { id: "string", label: "String", Visual: AgentString, frame: "size-32" },
] as const;

export function AgentStatePreview() {
  return (
    <Tabs defaultValue="states">
      <TabsList>
        <TabsTrigger value="states">Every state</TabsTrigger>
        <TabsTrigger value="switch">Switching</TabsTrigger>
      </TabsList>

      {/* Tabs unmount the hidden panel, which keeps the page under the browser's cap on live WebGL contexts. */}
      <TabsContent value="states">
        <Card>
          <CardContent className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-x-6 gap-y-4">
            <span />
            {AGENT_STATES.map((state) => (
              <span
                className="text-center text-sm text-muted-foreground"
                key={state.value}
              >
                {state.label}
              </span>
            ))}
            {STYLES.map(({ id, label, Visual, frame }) => (
              <React.Fragment key={id}>
                <span className="text-sm font-medium">{label}</span>
                {AGENT_STATES.map((state) => (
                  <div className="flex justify-center" key={state.value}>
                    <div className={frame}>
                      <Visual state={state.value} />
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="switch">
        <Switching />
      </TabsContent>
    </Tabs>
  );
}

function Switching() {
  const [state, setState] = React.useState<AgentState>("listening");

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-8">
        <ToggleGroup
          aria-label="Agent state"
          onValueChange={(value) => value && setState(value as AgentState)}
          type="single"
          value={state}
          variant="outline"
        >
          {AGENT_STATES.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="grid w-full grid-cols-3 items-center gap-6">
          {STYLES.map(({ id, label, Visual }) => (
            <div className="flex flex-col items-center gap-3" key={id}>
              <div className="h-48 w-full">
                <Visual state={state} />
              </div>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
