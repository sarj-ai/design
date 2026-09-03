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
} from "@/components/ui/alert-dialog"

/**
 * The PRD's update toggle, as the thing it actually is.
 *
 * "Updating the configuration affects all the other sources even for
 * scheduled/queued calls" is a consequence of pressing Save once, not a setting
 * to keep. As a switch it would sit permanently among the retry controls
 * answering a question about saving; as a confirmation it appears exactly when
 * it is true and names what it is about to move.
 *
 * The second sentence is the load-bearing one. Without it a reader cannot tell
 * whether Apply is about to overwrite the batch override they set an hour ago.
 */
export function SaveConfirmDialog({
  onConfirm,
  onOpenChange,
  open,
  queued,
  scheduled,
}: {
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  queued: number
  scheduled: number
}) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apply to calls already waiting?</AlertDialogTitle>
          <AlertDialogDescription>
            {/* An explicit locale, so the screenshots do not change with the
                machine that took them. */}
            {queued.toLocaleString("en-US")} queued and{" "}
            {scheduled.toLocaleString("en-US")} scheduled calls will switch to
            the new retry settings. Sources that override this scenario keep
            their own.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Apply</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
