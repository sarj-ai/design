"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { DismissGlyph } from "./dismiss-glyph";
import { GlassFilter } from "./glass-filter";
import { KindGlyph, TEXT_IN, textDelay, type GlyphKind } from "./kind-glyph";

/**
 * The new toast: glass card, kind glyph, title, description, one action.
 * Change `phase` to turn the toast into its next state in place — the glyph
 * builds again and the lines stagger in again.
 */
export function ToastCard({
  id,
  kind,
  title,
  description,
  action,
  phase = "",
  countdown,
  children,
}: {
  id: string | number;
  kind: GlyphKind;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; onClick: () => void };
  phase?: string;
  /** Time left, drawn as a line around the card's edge that drains. `tone` is a text colour class. */
  countdown?: { seconds: number; tone: string };
  /** Under the text, e.g. a progress bar. */
  children?: ReactNode;
}) {
  const filterId = `glass-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // The map is drawn for the card's own size, so it re-draws when a state change moves the height.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setSize({ width: el.offsetWidth, height: el.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      className="group/toast relative w-89 animate-toast-in bg-background/45 motion-reduce:animate-none"
      ref={ref}
      style={{ backdropFilter: `url(#${filterId})` }}
    >
      <GlassFilter height={size.height} id={filterId} width={size.width} />
      {countdown && <EdgeCountdown {...countdown} />}
      <CardContent className="flex flex-col gap-3" key={phase}>
        <div className="flex items-center gap-3">
          <KindGlyph kind={kind} />
          <p
            className={cn("flex-1 text-base font-semibold", TEXT_IN)}
            style={textDelay(kind, 0)}
          >
            {title}
          </p>
          {/* At rest a dash, so a stack of toasts stays quiet; pointing at it turns it into the X it is. */}
          <Button
            aria-label="Dismiss"
            className="group/dismiss text-muted-foreground"
            onClick={() => toast.dismiss(id)}
            size="icon-sm"
            variant="ghost"
          >
            <DismissGlyph />
          </Button>
        </div>
        {description && (
          <p
            className={cn("text-muted-foreground", TEXT_IN)}
            style={textDelay(kind, 1)}
          >
            {description}
          </p>
        )}
        {children}
        {action && (
          <Button
            className={cn("w-full", TEXT_IN)}
            onClick={action.onClick}
            style={textDelay(kind, 2)}
            variant="secondary"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Time left, as a ring on the card's own edge: one conic gradient, masked to a
 * 1.5px ring, that sweeps from the top centre clockwise. Its start and its
 * draining end are soft stops in the same gradient, so there is nothing to
 * band. A blurred twin glows under it. It keeps running while the stack is
 * pointed at, in step with the toast's own timer.
 */
function EdgeCountdown({ seconds, tone }: { seconds: number; tone: string }) {
  const style = { "--countdown": `${seconds}s` } as CSSProperties;
  return (
    <>
      <div
        aria-hidden
        className={cn("toast-countdown toast-edge-glow", tone)}
        style={style}
      />
      <div
        aria-hidden
        className={cn("toast-countdown toast-edge", tone)}
        style={style}
      />
    </>
  );
}
