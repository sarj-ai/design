"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

import { DOCS_SECTIONS, type DocsSection } from "@/lib/design-system/data";

/** The graph is drawn in its own world and the camera moves over it. */
const W = 1600;
const H = 1000;

const HUBS: Record<string, { x: number; y: number }> = {
  foundations: { x: 430, y: 330 },
  motion: { x: 1180, y: 250 },
  patterns: { x: 1210, y: 740 },
  "product-components": { x: 470, y: 770 },
};

/** Golden angle, so a cluster of any size spreads evenly without random numbers. */
const GOLDEN = 2.39996;

type Node = { id: string; title: string; x: number; y: number; k: number };

function topicsOf(section: DocsSection) {
  return section.groups.flatMap((group) => group.pages);
}

const CLUSTERS = DOCS_SECTIONS.map((section, s) => {
  const hub = HUBS[section.id] ?? { x: W / 2, y: H / 2 };
  const nodes: Node[] = topicsOf(section).map((topic, k) => {
    const angle = k * GOLDEN + s * 1.3;
    const radius = 120 + ((k * 53) % 170);
    return {
      id: topic.id,
      title: topic.title,
      x: hub.x + Math.cos(angle) * radius,
      y: hub.y + Math.sin(angle) * radius * 0.8,
      k,
    };
  });
  return { section, hub, nodes };
});

/** Threads between neighbouring clusters, so the four read as one system, not four islands. */
const THREADS = CLUSTERS.flatMap((cluster, s) => {
  const next = CLUSTERS[(s + 1) % CLUSTERS.length];
  return cluster.nodes
    .filter((_, k) => k % 3 === 0)
    .map((node, i) => {
      const other = next.nodes[(i * 2) % next.nodes.length];
      return { from: node, to: other, key: `${node.id}-${other.id}` };
    });
});

/** Where the camera sits: the whole graph centred in the cover's frame, one cluster per chapter, pushed right of the copy. */
function cameraFor(active: number) {
  if (active < 0) return { x: 682, y: 207, scale: 0.5 };
  const hub = CLUSTERS[active].hub;
  const scale = 1.3;
  return { x: W * 0.76 - hub.x * scale, y: H * 0.42 - hub.y * scale, scale };
}

const CAMERA = { type: "spring", bounce: 0, duration: 1.4 } as const;

/* The load: the camera starts close on the first hub — one node — and pulls back as the network blooms round it. */
const FIRST = CLUSTERS[0].hub;
const INTRO_CAMERA = {
  x: W * 0.72 - FIRST.x * 3,
  y: H * 0.55 - FIRST.y * 3,
  scale: 3,
};
const PULL_BACK = { duration: 2.6, ease: [0.645, 0.045, 0.355, 1] } as const;

/** When each cluster starts to grow on load, in seconds. */
function bloomAt(cluster: number) {
  return 0.2 + cluster * 0.35;
}

export function Constellation({
  active,
  receded = false,
}: {
  active: number;
  /** Past a chapter's opening screen: the graph dims and drops its labels so it never competes with the copy. */
  receded?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const camera = cameraFor(active);

  /* A few pixels of parallax under the pointer — enough to read as depth, not enough to chase. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20 });
  const sy = useSpring(py, { stiffness: 60, damping: 20 });

  /* The whole graph turns a little and leans in as the page is read, so it never sits still under a scroll. */
  const { scrollYProgress } = useScroll();
  const turn = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 6]);
  const lean = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.12]);

  useEffect(() => {
    if (reduced) return;
    function onMove(event: PointerEvent) {
      px.set((event.clientX / window.innerWidth - 0.5) * -28);
      py.set((event.clientY / window.innerHeight - 0.5) * -18);
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py, reduced]);

  return (
    <svg
      aria-hidden="true"
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox={`0 0 ${W} ${H}`}
    >
      <motion.g
        animate={{ opacity: receded ? 0.35 : 1 }}
        initial={false}
        style={{ x: sx, y: sy, rotate: turn, scale: lean }}
        transition={{ duration: 0.6 }}
      >
        <motion.g
          animate={camera}
          initial={reduced ? false : INTRO_CAMERA}
          style={{ originX: 0, originY: 0 }}
          transition={
            reduced ? { duration: 0 } : active < 0 ? PULL_BACK : CAMERA
          }
        >
          <motion.g
            animate={{ opacity: 0.18 }}
            initial={reduced ? false : { opacity: 0 }}
            stroke="currentColor"
            strokeWidth={1}
            transition={{ duration: 1.2, delay: bloomAt(CLUSTERS.length) }}
          >
            {THREADS.map((thread) => (
              <line
                key={thread.key}
                vectorEffect="non-scaling-stroke"
                x1={thread.from.x}
                x2={thread.to.x}
                y1={thread.from.y}
                y2={thread.to.y}
              />
            ))}
          </motion.g>

          {CLUSTERS.map((cluster, s) => (
            <Cluster
              cluster={cluster}
              focused={active === s && !receded}
              index={s}
              key={cluster.section.id}
              quiet={active >= 0 && active !== s}
              reduced={reduced}
            />
          ))}
        </motion.g>
      </motion.g>
    </svg>
  );
}

function Cluster({
  cluster,
  index,
  focused,
  quiet,
  reduced,
}: {
  cluster: (typeof CLUSTERS)[number];
  index: number;
  focused: boolean;
  quiet: boolean;
  reduced: boolean;
}) {
  const { hub, nodes, section } = cluster;

  return (
    <motion.g
      animate={{ opacity: quiet ? 0.3 : 1 }}
      initial={false}
      transition={{ duration: 0.6 }}
    >
      {/* The cluster floats as one piece — spokes, nodes and labels together — so nothing slips off its line. */}
      <motion.g
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{
          duration: 6 + index,
          delay: index * 0.7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Each spoke grows by moving its far end out to the node, so it always lands exactly on it — pathLength measured in screen space and stopped short under zoom. */}
        <g opacity={0.45} stroke="currentColor" strokeWidth={1}>
          {nodes.map((node) => (
            <motion.line
              animate={{ x2: node.x, y2: node.y }}
              initial={reduced ? false : { x2: hub.x, y2: hub.y }}
              key={node.id}
              transition={{
                duration: 0.7,
                delay: bloomAt(index) + 0.15 + node.k * 0.04,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              vectorEffect="non-scaling-stroke"
              x1={hub.x}
              y1={hub.y}
            />
          ))}
        </g>

        {/* A signal runs out along each spoke of the cluster in view. */}
        {focused && !reduced
          ? nodes.map((node) => (
              <motion.circle
                animate={{
                  cx: [hub.x, node.x],
                  cy: [hub.y, node.y],
                  opacity: [0, 1, 0],
                }}
                fill="currentColor"
                initial={{ cx: hub.x, cy: hub.y, opacity: 0 }}
                key={node.id}
                r={2.5}
                transition={{
                  duration: 2.4,
                  delay: node.k * 0.18,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: "easeInOut",
                }}
              />
            ))
          : null}

        {nodes.map((node) => (
          <g key={node.id}>
            <motion.rect
              animate={{ scale: 1, opacity: 0.9 }}
              fill="currentColor"
              height={9}
              initial={reduced ? false : { scale: 0, opacity: 0 }}
              rx={1.5}
              style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
              transition={{
                type: "spring",
                bounce: 0.4,
                duration: 0.5,
                delay: bloomAt(index) + 0.6 + node.k * 0.04,
              }}
              width={9}
              x={node.x - 4.5}
              y={node.y - 4.5}
            />
            <motion.text
              animate={{ opacity: focused ? 0.85 : 0 }}
              className="font-mono"
              fill="currentColor"
              fontSize={11}
              initial={false}
              transition={{
                duration: 0.4,
                delay: focused ? 0.5 + node.k * 0.04 : 0,
              }}
              x={node.x + 10}
              y={node.y + 4}
            >
              {node.title}
            </motion.text>
          </g>
        ))}

        <motion.circle
          animate={{ r: 5 }}
          cx={hub.x}
          cy={hub.y}
          fill="currentColor"
          initial={reduced ? false : { r: 0 }}
          transition={{
            type: "spring",
            bounce: 0.5,
            duration: 0.6,
            delay: bloomAt(index),
          }}
        />
        <motion.circle
          animate={{ r: 14, opacity: 0.5 }}
          cx={hub.x}
          cy={hub.y}
          fill="none"
          initial={reduced ? false : { r: 4, opacity: 0 }}
          transition={{ duration: 0.8, delay: bloomAt(index) + 0.1 }}
          stroke="currentColor"
          vectorEffect="non-scaling-stroke"
        />
        <motion.g
          animate={{ opacity: 1 }}
          initial={reduced ? false : { opacity: 0 }}
          transition={{ duration: 0.6, delay: bloomAt(index) + 0.3 }}
        >
          <text
            fill="currentColor"
            fontSize={18}
            fontWeight={600}
            textAnchor="middle"
            x={hub.x}
            y={hub.y - 44}
          >
            {section.title}
          </text>
          <text
            className="font-mono"
            fill="currentColor"
            fontSize={11}
            opacity={0.7}
            textAnchor="middle"
            x={hub.x}
            y={hub.y - 26}
          >
            {String(index + 1).padStart(2, "0")} · {nodes.length} topics
          </text>
        </motion.g>
      </motion.g>
    </motion.g>
  );
}
