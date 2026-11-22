"use client";

import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import {
  CURRENT_TOASTS,
  type CurrentToast,
} from "@/lib/mockups/custom-toasts-data";

const TOASTER_ID = "current";

/** Sends one toast the way the platform ships it today: Sonner's defaults. */
export function fireCurrent(item: CurrentToast, persist = false) {
  const options = {
    id: persist ? `current-${item.id}` : undefined,
    toasterId: TOASTER_ID,
    duration: persist ? Infinity : 6000,
    description: item.description,
    action: item.action ? { label: item.action, onClick: () => {} } : undefined,
  };
  if (item.kind === "default") toast(item.title, options);
  else toast[item.kind](item.title, options);
}

export function CurrentToaster({ expand }: { expand: boolean }) {
  return (
    <Toaster
      closeButton
      expand={expand}
      id={TOASTER_ID}
      position="bottom-right"
      theme="light"
      visibleToasts={CURRENT_TOASTS.length}
    />
  );
}
