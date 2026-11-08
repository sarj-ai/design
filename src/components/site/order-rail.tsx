"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/site/mockups-data";

const ORDERS: { value: Order; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "section", label: "By section" },
];

type Section = { id: string; label: string };

/** Where a group counts as being read, and where a jump lands its heading. Near the top because groups are short. */
const SIGHTLINE = 0.18;

/**
 * The index's sort, parked in the empty left gutter: a hairline with the three orders
 * beside it and a primary marker that slides to the one in use. Sorted by section, the
 * sections list under "By section" — a marker slides to the one being read. Only on screens wide enough to have a gutter;
 * below that the page keeps its Select and the floating surface dock.
 */
export function OrderRail({
  order,
  onOrderChange,
  sections,
}: {
  order: Order;
  onOrderChange: (order: Order) => void;
  sections: Section[];
}) {
  const index = ORDERS.findIndex((entry) => entry.value === order);
  const showSections = order === "section" && sections.length > 1;

  return (
    <div
      aria-label="Order"
      className="order-rail fixed start-8 top-32 bottom-8 z-sticky hidden flex-col gap-2 overflow-y-auto xl:flex"
      role="group"
    >
      <span className="ps-4 text-xs text-muted-foreground">Sort</span>
      <div className="relative flex flex-col border-s ps-2">
        <span
          aria-hidden
          className="absolute -start-px top-0 h-7 w-0.5 rounded-full bg-primary transition-transform duration-200 ease-out-cubic motion-reduce:transition-none"
          style={{ transform: `translateY(${index * 100}%)` }}
        />
        {ORDERS.map((entry) => {
          const current = entry.value === order;
          return (
            <Button
              aria-pressed={current}
              className={
                current
                  ? "order-rail-item justify-start text-foreground"
                  : "order-rail-item justify-start text-muted-foreground"
              }
              key={entry.value}
              onClick={() => onOrderChange(entry.value)}
              size="sm"
              variant="ghost"
            >
              {entry.label}
            </Button>
          );
        })}
      </div>

      {showSections ? <SectionList sections={sections} /> : null}
    </div>
  );
}

function SectionList({ sections }: { sections: Section[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState(0);
  // Outside the effect because a jump scrolls to one of them.
  const marks = React.useRef<number[]>([0]);
  // Set while a click's smooth scroll runs, so the marker goes straight to the clicked row instead of trailing through every section the scroll passes.
  const jumping = React.useRef(false);

  React.useEffect(() => {
    let queued = false;

    function read() {
      queued = false;

      const y = window.scrollY;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const line = window.innerHeight * SIGHTLINE;

      // `Math.max` keeps the marks ascending; a group that has not rendered collapses to zero length.
      const at = [0];
      for (let i = 1; i < sections.length; i += 1) {
        const el = document.getElementById(sections[i].id);
        const mark = el ? el.getBoundingClientRect().top + y - line : at[i - 1];
        // Clamped to the max scroll, or a last group near the document end could never become active.
        at.push(Math.min(Math.max(mark, at[i - 1]), maxScroll));
      }
      marks.current = at;

      let next = 0;
      for (let i = sections.length - 1; i > 0; i -= 1) {
        if (y >= at[i]) {
          next = i;
          break;
        }
      }

      // Same number when unchanged, so React bails out of the render.
      if (!jumping.current) setActive(next);
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(read);
    }

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  function jump(event: React.MouseEvent, to: number) {
    const top = marks.current[to];
    if (top === undefined) return;
    // The group's handover point (+1px), not the element, so a jump and the reading agree.
    event.preventDefault();
    setActive(to);
    jumping.current = true;
    const release = () => {
      jumping.current = false;
      window.removeEventListener("scrollend", release);
      window.clearTimeout(fallback);
    };
    // `scrollend` ends the hold. Already there, no scroll runs and it never fires; the timeout is a backstop longer than any smooth scroll.
    const fallback = window.setTimeout(
      release,
      Math.abs(window.scrollY - (top + 1)) < 2 ? 0 : 3000,
    );
    window.addEventListener("scrollend", release);
    window.scrollTo({ behavior: reduce ? "auto" : "smooth", top: top + 1 });
  }

  const current = Math.min(active, sections.length - 1);

  return (
    <nav aria-label="Sections" className="relative ms-4 flex flex-col border-s">
      {/* One marker for the whole list, sliding row to row — the same move as the sort marker above. Rows are a fixed h-6, so a row's offset is its index. */}
      <span
        aria-hidden
        className="absolute -start-px top-0 h-6 w-0.5 rounded-full bg-primary transition-transform duration-150 ease-out-cubic motion-reduce:transition-none"
        style={{ transform: `translateY(${current * 100}%)` }}
      />
      {sections.map((section, i) => (
        <a
          aria-current={i === current ? "location" : undefined}
          className="section-rail-item flex h-6 items-center ps-3 text-xs text-muted-foreground transition-colors duration-150 ease-out-cubic hover:text-foreground aria-[current=location]:text-foreground motion-reduce:transition-none"
          href={`#${section.id}`}
          key={section.id}
          onClick={(event) => jump(event, i)}
          style={{ "--i": i } as React.CSSProperties}
        >
          <span className="truncate">{section.label}</span>
        </a>
      ))}
    </nav>
  );
}
