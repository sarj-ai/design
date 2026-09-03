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
import { CancelCallIcon } from "@/components/conversations-revamp/drawer/icons"

/**
 * Cancelling a scheduled call, with a step in between.
 *
 * The button used to cancel on the click. Two reasons that is the wrong shape
 * here: cancelled is a terminal status, so there is nothing to undo — the
 * booking is gone and re-creating it means re-deriving the context brief — and
 * the button sits inside a panel a reader opens to *read*, where the only
 * other controls are inert. A destructive action one slip away from a reading
 * surface needs the slip to cost nothing.
 *
 * What the copy has to carry is the consequence, not the mechanic. "Are you
 * sure?" tells a reader nothing they did not know; that the customer will not
 * be called, and that the call goes to Failed – cancelled, is the thing they
 * are actually deciding.
 */
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
          {/* "Keep it scheduled" rather than "Cancel", because a Cancel button
              beside a Cancel call button asks the reader to work out which
              cancel is which. */}
          <AlertDialogCancel>Keep it scheduled</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Cancel call</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
