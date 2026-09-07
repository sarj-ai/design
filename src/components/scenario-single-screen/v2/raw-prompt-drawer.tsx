"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import {
  assemblePrompt,
  type SectionedPrompt,
} from "@/lib/scenario-single-screen-v2-data"

import {
  DismissIcon,
  RawPromptIcon,
} from "@/components/scenario-single-screen/v2/icons"

/**
 * What the model is actually sent.
 *
 * The structured fields are a view onto this string, so this is the thing that
 * proves nothing was hidden. It exists for two readers: the engineer who wants
 * to check exactly what shipped, and the person who pasted a prompt in from
 * somewhere else and wants it back out.
 *
 * Read-only on purpose. Editing here would need the markdown parsed back into
 * sections, and a heading typed slightly differently would silently drop a
 * field — losing somebody's work to a spelling. Editing stays where the labels
 * are; this stays the honest copy.
 */
export function RawPromptDrawer({
  onOpenChange,
  open,
  prompt,
  rtl,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
  prompt: SectionedPrompt
  rtl: boolean
}) {
  const raw = assemblePrompt(prompt)

  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-2xl!">
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="flex flex-col gap-0.5">
            <DrawerTitle>Raw prompt</DrawerTitle>
            <DrawerDescription>
              Exactly what the agent is sent, assembled from the fields.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <DismissIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
          data-vaul-no-drag
        >
          <Textarea
            aria-label="Raw prompt"
            className="min-h-140 font-mono"
            dir={rtl ? "rtl" : "ltr"}
            readOnly
            value={raw}
          />

          <Alert>
            <RawPromptIcon />
            <AlertTitle>Edit this above, not here</AlertTitle>
            <AlertDescription>
              Every heading here comes from a field on the page, so changing the
              wording of one there changes it here. Empty sections are left out
              rather than sent as a heading with nothing under it.
            </AlertDescription>
          </Alert>
        </div>

        <DrawerFooter className="flex-row items-center justify-between gap-4 border-t bg-muted">
          <span className="text-xs text-muted-foreground tabular-nums">
            {raw.length} characters
          </span>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
