"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  CurrentToaster,
  fireCurrent,
} from "@/components/mockups/custom-toasts/current-toasts";
import {
  fireNew,
  NewToaster,
} from "@/components/mockups/custom-toasts/new-toasts";
import { ReplayIcon } from "@/components/mockups/custom-toasts/replay-icon";
import { ScenariosIndex } from "@/components/mockups/custom-toasts/scenarios-index";
import {
  fireExport,
  fireRetry,
  fireUndo,
} from "@/components/mockups/custom-toasts/smart-toasts";
import { ReviewerSwitch } from "@/components/shared/reviewer-switch";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { CURRENT_TOASTS } from "@/lib/mockups/custom-toasts-data";

const STYLES = [
  { id: "new", label: "New" },
  { id: "current", label: "Current" },
] as const;

type Style = (typeof STYLES)[number]["id"];

const SMART: readonly { label: string; fire: () => void }[] = [
  { label: "Archive", fire: fireUndo },
  { label: "Export", fire: fireExport },
  { label: "Retry", fire: fireRetry },
];

export default function CustomToastsPage() {
  const [style, setStyle] = useState<Style>("new");
  const [expand, setExpand] = useState(false);
  const fire = style === "new" ? fireNew : fireCurrent;

  const switchStyle = (next: Style) => {
    toast.dismiss();
    setExpand(false);
    setStyle(next);
  };

  const showOne = (run: () => void) => {
    setExpand(false);
    run();
  };

  const showAll = () => {
    toast.dismiss();
    setExpand(true);
    setTimeout(() => {
      for (const item of CURRENT_TOASTS) fire(item, true);
    }, 300);
  };

  return (
    <MockupShell
      actions={
        <>
          <ReviewerSwitch
            label="Style"
            onChange={switchStyle}
            options={STYLES}
            value={style}
          />
          <ButtonGroup aria-label="Show a toast">
            {CURRENT_TOASTS.map((item) => (
              <Button
                key={item.id}
                onClick={() => showOne(() => fire(item))}
                size="sm"
                variant="outline"
              >
                {item.state}
              </Button>
            ))}
          </ButtonGroup>
          {style === "new" ? (
            <ButtonGroup aria-label="Toasts that do the next step">
              {SMART.map((entry) => (
                <Button
                  key={entry.label}
                  onClick={() => showOne(entry.fire)}
                  size="sm"
                  variant="outline"
                >
                  {entry.label}
                </Button>
              ))}
            </ButtonGroup>
          ) : null}
          <Button onClick={showAll} size="sm">
            <ReplayIcon />
            Show all
          </Button>
        </>
      }
      title="Custom toasts"
    >
      <AppShell active="Scenarios">
        <ScenariosIndex />
      </AppShell>
      {style === "new" ? (
        <NewToaster expand={expand} />
      ) : (
        <CurrentToaster expand={expand} />
      )}
    </MockupShell>
  );
}
