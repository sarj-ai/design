"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SCENARIOS,
  scenarioById,
  type Persona,
} from "@/lib/personas-depth-data"

/**
 * The reverse view the product is missing: which scenarios use this persona,
 * and a way to assign it to more. A scenario holds one persona per language,
 * so assigning replaces that language slot's current persona.
 */
export function ScenarioAssignmentDialog({
  persona,
  onOpenChange,
  onChangeScenarios,
}: {
  persona: Persona | null
  onOpenChange: (open: boolean) => void
  onChangeScenarios: (personaId: string, scenarioIds: string[]) => void
}) {
  const [pickedId, setPickedId] = React.useState("")

  const assigned = persona
    ? persona.scenarioIds
        .map(scenarioById)
        .filter((scenario) => scenario !== undefined)
    : []

  const assignable = persona
    ? SCENARIOS.filter(
        (scenario) =>
          scenario.languages.includes(persona.language) &&
          !persona.scenarioIds.includes(scenario.id),
      )
    : []

  function assign() {
    if (!persona || !pickedId) return
    onChangeScenarios(persona.id, [...persona.scenarioIds, pickedId])
    setPickedId("")
  }

  function remove(scenarioId: string) {
    if (!persona) return
    onChangeScenarios(
      persona.id,
      persona.scenarioIds.filter((id) => id !== scenarioId),
    )
  }

  return (
    <Dialog open={persona !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Scenarios · {persona?.name}</DialogTitle>
          <DialogDescription>
            Where this persona speaks. A scenario keeps one persona per
            language, so assigning replaces its current{" "}
            {persona?.language ?? ""} persona.
          </DialogDescription>
        </DialogHeader>

        {assigned.length > 0 ? (
          <ItemGroup className="gap-2">
            {assigned.map((scenario) => (
              <Item key={scenario.id} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>{scenario.name}</ItemTitle>
                  <ItemDescription>
                    {scenario.languages.join(" · ")}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => remove(scenario.id)}
                  >
                    Remove
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Not assigned to any scenarios yet. Scenarios without an explicit{" "}
            {persona?.language} persona fall back to the language default
            {persona?.isDefault ? " — which is this persona" : ""}.
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-sm font-medium">Assign to a scenario</span>
            <Select value={pickedId} onValueChange={setPickedId}>
              <SelectTrigger aria-label="Pick a scenario">
                <SelectValue
                  placeholder={
                    assignable.length
                      ? "Pick a scenario…"
                      : `No ${persona?.language} scenarios left`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assignable.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" disabled={!pickedId} onClick={assign}>
            Assign
          </Button>
        </div>

        {persona?.isDefault ? (
          <Badge variant="secondary" className="self-start">
            Language default — used wherever nothing is assigned
          </Badge>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
