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
  countdown?: { seconds: number; tone: string };
  children?: ReactNode;
}) {
  const filterId = `glass-${useId().replaceAll(/[^a-zA-Z0-9-]/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
      {countdown ? <EdgeCountdown {...countdown} /> : null}
      <CardContent className="flex flex-col gap-3" key={phase}>
        <div className="flex items-center gap-3">
          <KindGlyph kind={kind} />
          <p
            className={cn("flex-1 text-base font-semibold", TEXT_IN)}
            style={textDelay(kind, 0)}
          >
            {title}
          </p>
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
        {description === undefined ? null : (
          <p
            className={cn("text-muted-foreground", TEXT_IN)}
            style={textDelay(kind, 1)}
          >
            {description}
          </p>
        )}
        {children}
        {action ? (
          <Button
            className={cn("w-full", TEXT_IN)}
            onClick={action.onClick}
            style={textDelay(kind, 2)}
            variant="secondary"
          >
            {action.label}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EdgeCountdown({ seconds, tone }: { seconds: number; tone: string }) {
  const style: CSSProperties & Record<"--countdown", string> = {
    "--countdown": `${String(seconds)}s`,
  };
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
