"use client"

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
import { CancelCallIcon } from "@/components/mockups/conversations-revamp/drawer/icons"

export function CancelCallDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="self-end" size="sm" variant="destructive">
          <CancelCallIcon />
          Cancel call
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this scheduled call?</AlertDialogTitle>
          <AlertDialogDescription>
            The customer will not be called, and the context brief collected for
            it is discarded. The call moves to Failed – cancelled, which is a
            final status — it cannot be put back on the schedule.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Keep it scheduled</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Cancel call</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
