"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import {
  RecordingIndicator,
  useMicrophoneLevels,
  useSimulatedLevels,
} from "@/components/shared/recording-indicator"

export function RecordingPreview() {
  /* Simulated until the reader asks for their own microphone: a docs page must not open a permission prompt on load. */
  const [useMic, setUseMic] = React.useState(false)
  const mic = useMicrophoneLevels(useMic)
  const simulated = useSimulatedLevels(!useMic || mic.state !== "live")
  const speaking = useMic && mic.state === "live" ? mic.levels : simulated
  const silent = [0, 0, 0, 0]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3">
            <RecordingIndicator levels={speaking} />
            <span className="text-sm text-muted-foreground">
              {useMic && mic.state === "live"
                ? "Your microphone"
                : mic.state === "unavailable"
                  ? "Microphone blocked — simulated"
                  : "Speaking, simulated"}
            </span>
            <Button
              onClick={() => setUseMic((on) => !on)}
              size="sm"
              variant="outline"
            >
              {useMic ? "Stop microphone" : "Use your microphone"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3">
            <RecordingIndicator levels={silent} />
            <span className="text-sm text-muted-foreground">Silent</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <InContext />
        </CardContent>
      </Card>
    </div>
  )
}

function InContext() {
  const levels = useSimulatedLevels(true)
  const [elapsed, setElapsed] = React.useState(0)

  React.useEffect(() => {
    const started = Date.now()
    const timer = setInterval(
      () => setElapsed(((Date.now() - started) / 1000) % 20),
      100,
    )
    return () => clearInterval(timer)
  }, [])

  return (
    <Item variant="outline">
      <ItemMedia className="group-has-data-[slot=item-description]/item:translate-y-0 group-has-data-[slot=item-description]/item:self-center">
        <RecordingIndicator levels={levels} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="tabular-nums">
          <span>
            Recording 0:{String(Math.floor(elapsed)).padStart(2, "0")}
            <span className="font-normal text-muted-foreground"> / 0:20</span>
          </span>
        </ItemTitle>
        <ItemDescription>
          {elapsed < 6
            ? "Keep going — 6 seconds minimum"
            : "Stops on its own at 20 seconds"}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm">Stop</Button>
      </ItemActions>
      <ItemFooter>
        <Progress
          aria-label="Recording length"
          className="flex-1"
          value={(elapsed / 20) * 100}
        />
      </ItemFooter>
    </Item>
  )
}
