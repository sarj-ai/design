"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GlowProgress } from "./glow-progress";
import { ToastCard } from "./toast-card";

// Three toasts that carry the next step instead of only reporting the last one.
// Each owns its states and turns into the next one in place; none stacks a second toast.

export const LIVE_TOASTER_ID = "live";

// 1. Undo instead of confirm: the archive happens now, and the toast is the way back.
const UNDO_SECONDS = 6;

function UndoToast({ id }: { id: string | number }) {
  const [restored, setRestored] = useState(false);

  // Its own timer, not Sonner's, so pointing at the stack does not freeze the countdown ring.
  useEffect(() => {
    if (restored) return;
    const timer = setTimeout(() => toast.dismiss(id), UNDO_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [restored, id]);

  if (restored) {
    return (
      <ToastCard
        description="It takes calls again."
        id={id}
        kind="success"
        phase="restored"
        title="Appointment reminders restored"
      />
    );
  }

  return (
    <ToastCard
      action={{
        label: "Undo",
        onClick: () => {
          setRestored(true);
          setTimeout(() => toast.dismiss(id), 2500);
        },
      }}
      description="It no longer takes calls."
      id={id}
      kind="default"
      phase="archived"
      countdown={{ seconds: UNDO_SECONDS, tone: "text-primary" }}
      title="Appointment reminders archived"
    />
  );
}

export function fireUndo() {
  toast.custom((id) => <UndoToast id={id} />, {
    toasterId: LIVE_TOASTER_ID,
    duration: Infinity,
  });
}

// 2. Progress that becomes the result: one toast from "working" to "here it is".
function ExportToast({ id }: { id: string | number }) {
  const [progress, setProgress] = useState(0);
  // Done once the bar has visibly filled, not when the number first hits 100.
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => toast.dismiss(id), 8000);
      return () => clearTimeout(timer);
    }
    if (progress >= 100) return;
    // Uneven steps, so it reads as work rather than a timer; the bar smooths them out.
    const timer = setTimeout(
      () =>
        setProgress((value) =>
          Math.min(100, value + 6 + Math.round(Math.random() * 10)),
        ),
      220,
    );
    return () => clearTimeout(timer);
  }, [done, progress, id]);

  if (done) {
    return (
      <ToastCard
        action={{ label: "Download", onClick: () => toast.dismiss(id) }}
        description="calls-last-30-days.csv · 1,284 rows"
        id={id}
        kind="success"
        phase="done"
        title="Export ready"
      />
    );
  }

  return (
    <ToastCard
      description="Calls from the last 30 days"
      id={id}
      kind="loading"
      phase="running"
      title="Generating export"
    >
      <div
        aria-label="Export progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        role="progressbar"
      >
        <GlowProgress
          onSettled={() => setTimeout(() => setDone(true), 250)}
          value={progress}
        />
      </div>
    </ToastCard>
  );
}

export function fireExport() {
  toast.custom((id) => <ExportToast id={id} />, {
    toasterId: LIVE_TOASTER_ID,
    duration: Infinity,
  });
}

// 3. Errors that fix themselves: count down, retry, and land on the result.
const RETRY_SECONDS = 3;

function RetryToast({ id }: { id: string | number }) {
  const [phase, setPhase] = useState<"waiting" | "retrying" | "done">(
    "waiting",
  );
  const [seconds, setSeconds] = useState(RETRY_SECONDS);

  useEffect(() => {
    const timer =
      phase === "waiting"
        ? setTimeout(
            () =>
              seconds <= 1 ? setPhase("retrying") : setSeconds((s) => s - 1),
            1000,
          )
        : phase === "retrying"
          ? setTimeout(() => setPhase("done"), 1200)
          : setTimeout(() => toast.dismiss(id), 3000);
    return () => clearTimeout(timer);
  }, [phase, seconds, id]);

  if (phase === "done") {
    return (
      <ToastCard
        description="The catalog is up to date."
        id={id}
        kind="success"
        phase="done"
        title="Model updated"
      />
    );
  }

  if (phase === "retrying") {
    return (
      <ToastCard
        description="Updating the model catalog."
        id={id}
        kind="loading"
        phase="retrying"
        title="Retrying"
      />
    );
  }

  return (
    <ToastCard
      action={{ label: "Retry now", onClick: () => setPhase("retrying") }}
      description={`The connection dropped. Retrying in ${seconds}s.`}
      id={id}
      kind="error"
      phase="waiting"
      countdown={{ seconds: RETRY_SECONDS, tone: "text-destructive" }}
      title="Could not update model"
    />
  );
}

export function fireRetry() {
  toast.custom((id) => <RetryToast id={id} />, {
    toasterId: LIVE_TOASTER_ID,
    duration: Infinity,
  });
}
