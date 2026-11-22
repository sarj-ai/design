"use client";

import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import {
  CURRENT_TOASTS,
  type CurrentToast,
} from "@/lib/mockups/custom-toasts-data";

import { LIVE_TOASTER_ID } from "./smart-toasts";
import { ToastCard } from "./toast-card";

function NewToast({ item, id }: { item: CurrentToast; id: string | number }) {
  return (
    <ToastCard
      action={
        item.action
          ? { label: item.action, onClick: () => toast.dismiss(id) }
          : undefined
      }
      description={item.description}
      id={id}
      kind={item.kind}
      title={item.title}
    />
  );
}

export function fireNew(item: CurrentToast, persist = false) {
  toast.custom((id) => <NewToast id={id} item={item} />, {
    id: persist ? `new-${item.id}` : undefined,
    toasterId: LIVE_TOASTER_ID,
    duration: persist ? Infinity : 6000,
  });
}

export function NewToaster({ expand }: { expand: boolean }) {
  return (
    <Toaster
      className="toast-stack"
      expand={expand}
      id={LIVE_TOASTER_ID}
      position="bottom-right"
      theme="light"
      visibleToasts={expand ? CURRENT_TOASTS.length : 3}
    />
  );
}
