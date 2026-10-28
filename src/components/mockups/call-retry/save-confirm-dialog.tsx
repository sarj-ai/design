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
