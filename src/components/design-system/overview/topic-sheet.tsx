"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

import { CloseIcon } from "@/components/design-system/icons";
import { Button } from "@/components/ui/button";
import { DOCS_SECTIONS } from "@/lib/design-system/data";
import { cn } from "@/lib/utils";

/** Topics whose demo needs the sheet's full width; the rest read at max-w-3xl. */
export const FULL_WIDTH_TOPICS = new Set([
  "colour",
  "index",
  "admin-view",
  "notifications",
  "developers",
  "unsaved-changes",
  "creation-flow",
  "json-view",
  "alert",
  "integration-card",
  "surfaces",
  "error-state",
]);

/** power4.inOut — the sheet's one curve, up and down. */
const SLIDE = [0.77, 0, 0.175, 1] as const;
/** power3.out */
const ARRIVE = [0.215, 0.61, 0.355, 1] as const;

function locate(topicId: string) {
  for (const section of DOCS_SECTIONS) {
    for (const group of section.groups) {
      const topic = group.pages.find((page) => page.id === topicId);
      if (topic) return { section, topic };
    }
  }
  return null;
}

/**
 * A topic, opened over the overview. One sheet slides up and the same sheet slides down: the page
 * behind never unmounts, so closing returns the reader to exactly where they were. `instant` is
 * for a topic URL loaded directly — the sheet is simply there, with nothing replayed.
 */
export function TopicSheet({
  topicId,
  views,
  instant,
  onClose,
}: {
  topicId: string | null;
  views: Record<string, React.ReactNode>;
  instant: boolean;
  onClose: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const still = reduced || instant;
  const found = topicId ? locate(topicId) : null;

  /* The overview must not scroll under the sheet, and Escape closes it. */
  useEffect(() => {
    if (!found) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [found, onClose]);

  return (
    <AnimatePresence>
      {found ? (
        <div
          aria-label={found.topic.title}
          aria-modal="true"
          className="fixed inset-0 z-modal"
          key="topic"
          role="dialog"
        >
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-foreground/40"
            exit={{ opacity: 0 }}
            initial={still ? false : { opacity: 0 }}
            onClick={onClose}
            transition={{ duration: reduced ? 0 : 0.35 }}
          />

          <motion.div
            animate={{ y: 0 }}
            className="absolute inset-x-4 top-4 bottom-0 overflow-hidden rounded-t-3xl bg-background text-foreground"
            exit={{ y: "100%" }}
            initial={still ? false : { y: "100%" }}
            transition={{ duration: reduced ? 0 : 0.55, ease: SLIDE }}
          >
            <Button
              aria-label="Close"
              className="absolute end-4 top-4 z-raised"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <CloseIcon />
            </Button>

            <div className="size-full overflow-y-auto">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mx-auto flex w-full flex-col gap-8 px-6 pt-14 pb-16",
                  FULL_WIDTH_TOPICS.has(found.topic.id)
                    ? "max-w-none sm:px-10"
                    : "max-w-3xl",
                )}
                initial={still ? false : { opacity: 0, y: 12 }}
                key={found.topic.id}
                transition={{
                  duration: reduced ? 0 : 0.4,
                  delay: still ? 0 : 0.35,
                  ease: ARRIVE,
                }}
              >
                <header className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">
                    {found.section.title}
                  </p>
                  <h2 className="text-2xl font-semibold">
                    {found.topic.title}
                  </h2>
                  <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
                    {found.topic.description}
                  </p>
                </header>
                {views[found.topic.id]}
              </motion.div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
