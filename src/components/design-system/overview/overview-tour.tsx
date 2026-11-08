"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Constellation } from "@/components/design-system/overview/constellation";
import { TopicSheet } from "@/components/design-system/overview/topic-sheet";
import { SECTION_FIGURES } from "@/components/design-system/section-figures";
import { TOPIC_FIGURES } from "@/components/design-system/topic-figures";
import { Button } from "@/components/ui/button";
import {
  DOCS_SECTIONS,
  type DocsPage,
  type DocsSection,
} from "@/lib/design-system/data";
import { DOCS_ROOT, docsHref } from "@/lib/design-system/nav";
import { cn } from "@/lib/utils";

/** One surface per chapter; the page fades between them as the reader crosses into the next. Cover first. */
const SURFACES = [
  "bg-primary-dark",
  "bg-orb-deep",
  "bg-primary",
  "bg-primary-tint-foreground",
  "bg-primary-dark",
];

/** power3.out */
const ARRIVE = [0.215, 0.61, 0.355, 1] as const;

/* A title arrives letter by letter, each one sharpening out of a blur. */
const LETTERS: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.035 } },
};
const LETTER: Variants = {
  hidden: { opacity: 0.12, y: "0.2em", filter: "blur(12px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: ARRIVE },
  },
};

/** Opens a topic in the sheet over the overview. Links keep their href, so a new tab still works. */
const OpenTopic = createContext<(topicId: string) => void>(() => {});

function useOpenTopicLink(topicId: string) {
  const open = useContext(OpenTopic);
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    open(topicId);
  };
}

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

/**
 * On a wide screen the cover holds the graph in a frame to the right of the copy, and the first
 * scroll opens the frame out to the whole page. Narrow screens and reduced motion start full bleed.
 */
function useFrame(open: boolean) {
  const { scrollY } = useScroll();
  const [viewport, setViewport] = useState(900);
  useEffect(() => {
    const update = () => setViewport(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const t = useTransform(scrollY, [0, viewport * 0.7], [open ? 1 : 0, 1], {
    clamp: true,
  });
  const top = useTransform(t, [0, 1], [96, 0]);
  /* 48px: the nav and the content column both stop 3rem (lg:pe-12) from the edge, so the frame does too. */
  const edge = useTransform(t, [0, 1], [48, 0]);
  const left = useTransform(t, [0, 1], [50, 0]);
  const round = useTransform(t, [0, 1], [28, 0]);
  return useMotionTemplate`inset(${top}px ${edge}px ${edge}px ${left}% round ${round}px)`;
}

function topicsOf(section: DocsSection) {
  return section.groups.flatMap((group) => group.pages);
}

function ordinal(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function OverviewTour({
  views,
  initialSection = null,
  initialTopic = null,
}: {
  /** Each topic's content, rendered on the server, for the sheet. */
  views: Record<string, React.ReactNode>;
  /** A section URL lands on its chapter. */
  initialSection?: string | null;
  /** A topic URL lands on its chapter with the topic already open. */
  initialTopic?: string | null;
}) {
  /* -1 is the cover; 0… are the chapters. */
  const [active, setActive] = useState(-1);
  /* Whether a chapter's opening screen is in view; past it, the graph steps back behind the reading. */
  const [opening, setOpening] = useState(true);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const main = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const wide = useWide();
  const frame = useFrame(!wide || reduced);
  /*
   * The open topic lives in this page, not in a route: opening and closing rewrite the address in
   * place (replaceState), so the topic stays shareable while Next never navigates. A Back-driven
   * navigation would change the route's params and remount the whole overview — losing the scroll
   * and replaying everything behind the sheet.
   */
  const [topic, setTopic] = useState<string | null>(initialTopic);
  /* True only for a topic loaded directly, so its sheet is simply there; any later open animates. */
  const [instant, setInstant] = useState(Boolean(initialTopic));
  /* The address to return to on close: where the reader was when they opened the topic. */
  const back = useRef<string | null>(null);

  const openTopic = (topicId: string) => {
    back.current = window.location.pathname + window.location.hash;
    setInstant(false);
    window.history.replaceState(window.history.state, "", docsHref(topicId));
    setTopic(topicId);
  };

  const closeTopic = useCallback(() => {
    setInstant(false);
    const to =
      back.current ??
      (initialSection ? `${DOCS_ROOT}#${initialSection}` : DOCS_ROOT);
    window.history.replaceState(window.history.state, "", to);
    back.current = null;
    setTopic(null);
  }, [initialSection]);

  useEffect(() => {
    if (!initialSection) return;
    document
      .getElementById(initialSection)
      ?.scrollIntoView({ behavior: "instant" });
  }, [initialSection]);

  useEffect(() => {
    const heads = main.current?.querySelectorAll("[data-opening]") ?? [];
    /* The first callback reports every head at once, so track the set rather than the last entry. */
    const inView = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        setOpening(inView.size > 0);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const head of heads) observer.observe(head);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setActive(Number((entry.target as HTMLElement).dataset.chapter));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const element of refs.current) if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative -mt-20 flex-1 text-primary-foreground" ref={main}>
      <OpenTopic.Provider value={openTopic}>
        <div aria-hidden="true" className="fixed inset-0 z-base bg-orb-deep">
          <motion.div
            className={cn(
              "absolute inset-0 transition-colors duration-300 ease-in-out-cubic motion-reduce:transition-none",
              SURFACES[active + 1],
            )}
            style={{ clipPath: frame }}
          >
            <Constellation active={active} receded={!opening} />
          </motion.div>
        </div>

        <Rail active={active} />

        <section
          className="relative z-raised flex min-h-svh flex-col justify-end px-6 pt-40 pb-16 lg:ps-56 lg:pe-12"
          data-chapter={-1}
          ref={(element) => {
            refs.current[0] = element;
          }}
        >
          <div data-opening>
            <Cover />
          </div>
        </section>

        {DOCS_SECTIONS.map((section, s) => (
          <section
            className="relative z-raised scroll-mt-24 px-6 pb-32 lg:ps-56 lg:pe-12"
            data-chapter={s}
            id={section.id}
            key={section.id}
            ref={(element) => {
              refs.current[s + 1] = element;
            }}
          >
            <Chapter index={s} section={section} />
          </section>
        ))}
      </OpenTopic.Provider>
      <TopicSheet
        instant={instant}
        onClose={closeTopic}
        topicId={topic}
        views={views}
      />
    </main>
  );
}

function Cover() {
  return (
    <div className="flex max-w-xl flex-col gap-10 lg:max-w-md">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl leading-none font-semibold tracking-tighter text-balance xl:text-7xl">
          Every rule, written down.
        </h1>
        <p className="max-w-md text-base text-pretty text-primary-foreground/70">
          The tokens, primitives and patterns the product is built from, and the
          lint rules that keep a screen from drifting off them.
        </p>
      </div>

      <ol className="flex flex-col">
        {DOCS_SECTIONS.map((section, s) => (
          <li
            className="border-t border-primary-foreground/20 last:border-b"
            key={section.id}
          >
            <Link
              className="group flex items-baseline gap-4 py-3 transition-opacity duration-150 ease-out-cubic hover:opacity-70 motion-reduce:transition-none"
              data-no-transition
              href={`#${section.id}`}
            >
              <span className="font-mono text-xs text-primary-foreground/60">
                {ordinal(s)}
              </span>
              <span className="flex-1 text-lg font-medium">
                {section.title}
              </span>
              <span className="font-mono text-xs text-primary-foreground/60">
                {topicsOf(section).length} topics
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Rail({ active }: { active: number }) {
  return (
    <nav
      aria-label="Sections"
      className={cn(
        "fixed start-6 top-1/2 z-sticky hidden -translate-y-1/2 flex-col gap-2.5 transition-opacity duration-300 ease-out-cubic motion-reduce:transition-none lg:flex",
        active < 0 ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      {DOCS_SECTIONS.map((section, s) => (
        <RailItem
          current={active === s}
          index={s}
          key={section.id}
          section={section}
        />
      ))}
    </nav>
  );
}

/** One rail entry, with a hairline that fills as its chapter is read. */
function RailItem({
  section,
  index,
  current,
}: {
  section: DocsSection;
  index: number;
  current: boolean;
}) {
  const { scrollY } = useScroll();
  const [span, setSpan] = useState({ top: 0, height: 1, viewport: 900 });

  useEffect(() => {
    function measure() {
      const element = document.getElementById(section.id);
      if (!element) return;
      setSpan({
        top: element.getBoundingClientRect().top + window.scrollY,
        height: element.offsetHeight,
        viewport: window.innerHeight,
      });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [section.id]);

  const read = useTransform(scrollY, (y) =>
    Math.min(1, Math.max(0, (y + span.viewport / 2 - span.top) / span.height)),
  );

  return (
    <Link
      className={cn(
        "flex items-center gap-3 text-sm transition-opacity duration-150 ease-out-cubic motion-reduce:transition-none",
        current ? "opacity-100" : "opacity-50 hover:opacity-80",
      )}
      data-no-transition
      href={`#${section.id}`}
    >
      <span className="font-mono text-xs">{ordinal(index)}</span>
      <span className="w-24">{section.title}</span>
      <span className="relative h-px w-10 overflow-hidden bg-primary-foreground/25">
        <motion.span
          className="absolute inset-0 origin-left bg-primary-foreground"
          style={{ scaleX: read }}
        />
      </span>
    </Link>
  );
}

function Chapter({ index, section }: { index: number; section: DocsSection }) {
  const reduced = useReducedMotion() ?? false;
  const topics = topicsOf(section);
  const [lead, ...rest] = topics;
  const pair = rest.slice(0, 2);
  const facts = rest.slice(2);

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex min-h-svh flex-col justify-end gap-6 pb-16"
        data-opening
      >
        {/* The clip watches, the title moves: a translated child never counts as in view inside its own clip. */}
        <motion.h2
          aria-label={section.title}
          className="pb-4 text-7xl leading-none font-semibold tracking-tighter md:text-8xl lg:text-9xl"
          initial={reduced ? false : "hidden"}
          variants={LETTERS}
          viewport={{ once: true, amount: 0.6 }}
          whileInView="shown"
        >
          {[...section.title].map((letter, i) => (
            <motion.span
              aria-hidden="true"
              className="inline-block whitespace-pre"
              key={i}
              variants={LETTER}
            >
              {letter}
            </motion.span>
          ))}
        </motion.h2>
        <div className="flex max-w-2xl flex-col gap-4">
          <p className="text-lg text-pretty text-primary-foreground/80">
            {section.description}
          </p>
          <div className="flex items-center gap-4 font-mono text-xs text-primary-foreground/60">
            <span>{ordinal(index)}</span>
            <span>{topics.length} topics</span>
          </div>
        </div>
      </div>

      {lead ? <Panel sectionId={section.id} topic={lead} wide /> : null}

      {pair.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {pair.map((topic) => (
            <Panel key={topic.id} topic={topic} />
          ))}
        </div>
      ) : null}

      {facts.length ? (
        <ul className="grid gap-x-8 gap-y-10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((topic) => (
            <Fact key={topic.id} topic={topic} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * A topic as a panel. Its drawing sits in a clipped tile beside the copy, never under it: topic
 * drawings are 240-unit squares and section drawings 4:1 strips, and both run their guides to the edge.
 */
function Panel({
  topic,
  sectionId,
  wide = false,
}: {
  topic: DocsPage;
  /** The lead panel carries its section's strip instead of the topic's square. */
  sectionId?: string;
  wide?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const SectionFigure = sectionId ? SECTION_FIGURES[sectionId] : undefined;
  const TopicFigure = TOPIC_FIGURES[topic.id];
  const openLink = useOpenTopicLink(topic.id);

  return (
    <motion.article
      className={cn(
        "flex flex-col gap-6 rounded-2xl bg-primary-foreground/10 p-6 backdrop-blur-sm lg:p-8",
        wide && SectionFigure
          ? "lg:gap-8"
          : "sm:flex-row sm:items-start sm:justify-between",
      )}
      initial={reduced ? false : { opacity: 0, y: 32 }}
      transition={{ duration: 0.7, ease: ARRIVE }}
      viewport={{ once: true, amount: 0.3 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="flex max-w-md flex-col gap-3">
        <h3 className="flex items-center gap-2 text-lg font-medium">
          <span className="size-1.5 shrink-0 rounded-full bg-current" />
          {topic.title}
        </h3>
        <p className="text-pretty text-primary-foreground/75">
          {topic.description}
        </p>
        <Button asChild className="self-start" size="xs" variant="secondary">
          <Link data-no-transition href={docsHref(topic.id)} onClick={openLink}>
            Read topic
          </Link>
        </Button>
      </div>

      {wide && SectionFigure ? (
        <div
          aria-hidden="true"
          className="overflow-hidden rounded-xl bg-primary-foreground/5 text-primary-foreground/70"
        >
          <SectionFigure />
        </div>
      ) : TopicFigure ? (
        <div
          aria-hidden="true"
          className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-xl bg-primary-foreground/5 text-primary-foreground/70"
        >
          <TopicFigure className="absolute inset-0 h-full" />
        </div>
      ) : null}
    </motion.article>
  );
}

function Fact({ topic }: { topic: DocsPage }) {
  const openLink = useOpenTopicLink(topic.id);
  return (
    <li className="flex gap-2 text-sm">
      <span className="mt-2 size-1 shrink-0 rounded-full bg-current" />
      <div className="flex flex-col gap-1">
        <Link
          className="font-medium underline decoration-primary-foreground/40 underline-offset-4 transition-colors duration-150 ease-out-cubic hover:decoration-primary-foreground motion-reduce:transition-none"
          data-no-transition
          href={docsHref(topic.id)}
          onClick={openLink}
        >
          {topic.title}
        </Link>
        <p className="text-pretty text-primary-foreground/70">
          {topic.description}
        </p>
      </div>
    </li>
  );
}
