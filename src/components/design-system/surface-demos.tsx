"use client"

import * as React from "react"

import { toast } from "sonner"

import { MultiStepCreateDialog } from "@/components/design-system/multi-step-dialog"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CloseIcon } from "@/components/design-system/icons"
import {
  DEMO_RECORDINGS,
  DEMO_VOICES,
  type SurfaceChoice,
} from "@/lib/design-system-data"

/**
 * The four surfaces, opened rather than described.
 *
 * The diagram above each one says where the surface sits; this says what it
 * feels like to be in it — which is the half a reader cannot get from a
 * criterion. Same object throughout so the comparison is about the surface and
 * not about the content: picking a voice is inline, tuning one is a drawer,
 * deleting one is a pop-up, and making one runs across steps.
 */
export function SurfaceDemo({ variant }: { variant: SurfaceChoice["id"] }) {
  if (variant === "inline") return <InlineDemo />
  if (variant === "drawer") return <DrawerDemo />
  if (variant === "multi-step") return <CreateVoiceDialog />
  return <PopupDemo />
}

/**
 * Inline: the page is already about this, so there is nothing to open. The
 * field swaps in where the value was and the reader never leaves.
 */
function InlineDemo() {
  const [editing, setEditing] = React.useState(false)
  const [voice, setVoice] = React.useState(DEMO_VOICES[0].id)
  const [draft, setDraft] = React.useState(voice)

  const current = DEMO_VOICES.find((entry) => entry.id === voice)

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Voice</span>
          <span className="text-sm text-muted-foreground">
            {current?.label}
          </span>
        </div>
        <Button
          onClick={() => {
            setDraft(voice)
            setEditing(true)
          }}
          size="sm"
          variant="outline"
        >
          Change
        </Button>
      </div>
    )
  }

  return (
    <Field>
      <FieldLabel htmlFor="surface-inline-voice">Voice</FieldLabel>
      <Select onValueChange={setDraft} value={draft}>
        <SelectTrigger className="w-full" id="surface-inline-voice">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DEMO_VOICES.map((entry) => (
            <SelectItem key={entry.id} value={entry.id}>
              {entry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Save and Cancel belong to the field, not to a form: inline editing
          that saves on blur leaves a reader unsure whether it took. */}
      <div className="flex justify-end gap-2">
        <Button onClick={() => setEditing(false)} size="sm" variant="ghost">
          Cancel
        </Button>
        <Button
          onClick={() => {
            setVoice(draft)
            setEditing(false)
          }}
          size="sm"
        >
          Save
        </Button>
      </div>
    </Field>
  )
}

/**
 * Drawer: the agent page is still the subject, so it stays legible behind the
 * panel — which is the whole argument for the surface.
 */
function DrawerDemo() {
  const [confirm, setConfirm] = React.useState(true)
  const [timeout, setTimeout] = React.useState("20")

  return (
    <Drawer direction="right">
      {/* The row keeps the trigger at its own width — a stretched button in a
          card column reads as the card's primary action, which it is not. */}
      <DrawerTrigger asChild>
        <Button className="self-start" size="sm" variant="outline">
          Configure tool
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="flex flex-col gap-0.5">
            <DrawerTitle>Book appointment</DrawerTitle>
            <DrawerDescription>
              One tool on the agent behind this panel.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-col gap-6 p-4">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="surface-drawer-confirm">
                Read the booking back
              </FieldLabel>
              <FieldDescription>
                The agent repeats the date and time before it commits.
              </FieldDescription>
            </FieldContent>
            <Switch
              checked={confirm}
              id="surface-drawer-confirm"
              onCheckedChange={setConfirm}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="surface-drawer-timeout">Timeout</FieldLabel>
            <FieldDescription>
              How long the booking system has to answer before the agent moves
              on.
            </FieldDescription>
            <Select onValueChange={setTimeout} value={timeout}>
              <SelectTrigger className="w-full" id="surface-drawer-timeout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="20">20 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DrawerFooter className="flex-row justify-end border-t">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button>Save</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

/**
 * Pop-up: the one thing it is for. A decision the reader has to finish before
 * the page means anything again — which is why it takes the page rather than
 * sitting beside it, and why it is over in one screen.
 */
function PopupDemo() {
  return <DeleteAgentDialog />
}

/**
 * Multi-step: creating a voice, on the shared multi-step shell.
 *
 * It sits under its own surface rather than beside the delete dialog, where it
 * used to be: both open over the page, but one is answered in a sentence and
 * the other is three screens of work, and putting them in one cell was the
 * reason the comparison never named the second.
 *
 * It was a hand-rolled three-step dialog with its own step counter, its own
 * Back and its own footer — written before that shell existed, and the reason
 * the shell exists. Rebuilt on it, the flow gains the review step the pattern
 * requires and cannot lose Back or the submitting state, because it no longer
 * owns them.
 *
 * The second step's field depends on the first step's answer, which is why the
 * steps are built rather than declared: a caller composes the array, so a
 * branch is a normal conditional and not a feature the shell has to grow.
 */
function CreateVoiceDialog() {
  const [source, setSource] = React.useState("clone")
  const [recording, setRecording] = React.useState(DEMO_RECORDINGS[0].id)
  const [library, setLibrary] = React.useState(DEMO_VOICES[0].id)
  const [name, setName] = React.useState("")

  const recordingLabel = DEMO_RECORDINGS.find(
    (entry) => entry.id === recording,
  )?.label
  const libraryLabel = DEMO_VOICES.find((entry) => entry.id === library)?.label
  const cloning = source === "clone"

  return (
    <MultiStepCreateDialog
      onCreated={() =>
        toast(`${name.trim() || "The voice"} is being created`, {
          description: `${
            cloning
              ? `Cloned from ${recordingLabel}`
              : `Started from ${libraryLabel}`
          }. It appears in the picker once it is ready.`,
        })
      }
      steps={[
        {
          title: "Source",
          description: "Where does the voice come from?",
          content: (
            <RadioGroup onValueChange={setSource} value={source}>
              <ItemGroup className="gap-2">
                <Item size="sm" variant="outline">
                  <ItemMedia>
                    <RadioGroupItem id="surface-source-clone" value="clone" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <Label htmlFor="surface-source-clone">
                        Clone from a recording
                      </Label>
                    </ItemTitle>
                    <ItemDescription>
                      Uses a call the agent has already taken.
                    </ItemDescription>
                  </ItemContent>
                </Item>

                <Item size="sm" variant="outline">
                  <ItemMedia>
                    <RadioGroupItem
                      id="surface-source-library"
                      value="library"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <Label htmlFor="surface-source-library">
                        Start from a library voice
                      </Label>
                    </ItemTitle>
                    <ItemDescription>
                      Ready immediately, and tuned afterwards.
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </RadioGroup>
          ),
        },
        cloning
          ? {
              title: "Recording",
              description: "Pick the call to clone it from.",
              content: (
                <Field>
                  <FieldLabel htmlFor="surface-create-recording">
                    Recording
                  </FieldLabel>
                  <FieldDescription>
                    Thirty seconds of the customer-facing side is enough.
                  </FieldDescription>
                  <Select onValueChange={setRecording} value={recording}>
                    <SelectTrigger
                      className="w-full"
                      id="surface-create-recording"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_RECORDINGS.map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {entry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ),
            }
          : {
              title: "Library voice",
              description: "Pick the voice to start from.",
              content: (
                <Field>
                  <FieldLabel htmlFor="surface-create-library">
                    Library voice
                  </FieldLabel>
                  <FieldDescription>
                    Speed and pitch stay editable after it is created.
                  </FieldDescription>
                  <Select onValueChange={setLibrary} value={library}>
                    <SelectTrigger
                      className="w-full"
                      id="surface-create-library"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_VOICES.map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {entry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ),
            },
        {
          title: "Name",
          description: "What it is called in the voice picker.",
          content: (
            <Field>
              <FieldLabel htmlFor="surface-create-name">Name</FieldLabel>
              <FieldDescription>
                What it is called in the voice picker.
              </FieldDescription>
              <Input
                id="surface-create-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Reservations — Gulf"
                value={name}
              />
            </Field>
          ),
        },
      ]}
      submit={async () => {
        await new Promise((resolve) => setTimeout(resolve, 600))
        return null
      }}
      submitLabel="Create voice"
      submittingLabel="Creating voice"
      summary={[
        {
          term: "Source",
          value: cloning
            ? `Cloned from ${recordingLabel}`
            : `Started from ${libraryLabel}`,
        },
        { term: "Name", value: name.trim() || "Not set" },
      ]}
      title="Create voice"
    >
      <Button size="sm" variant="outline">
        Create voice
      </Button>
    </MultiStepCreateDialog>
  )
}

/**
 * The decision: one question, and the consequence spelled out rather than
 * "are you sure". An AlertDialog rather than a Dialog because there is nothing
 * to fill in — the reader is answering, not working.
 */
function DeleteAgentDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          Delete agent
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete the Reservations agent?</AlertDialogTitle>
          <AlertDialogDescription>
            Its scenarios and its phone number mapping go with it, and the
            number stops answering. Calls it has already taken keep their
            transcripts under the workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {/* Named for what it does rather than "Cancel", which beside a delete
              is a second word for the same button. */}
          <AlertDialogCancel>Keep agent</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              toast("Reservations agent deleted", {
                description: "Its number no longer answers.",
              })
            }
            variant="destructive"
          >
            Delete agent
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
