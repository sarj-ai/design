"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import {
  codeLabel,
  REBUILD_DAYS,
  type Payload,
} from "@/lib/mockups/webhook-reruns-data";

const PAYLOADS: readonly {
  value: Payload;
  label: string;
  description: string;
}[] = [
  {
    value: "stored",
    label: "Stored payload",
    description: "What was sent at the time. Failed deliveries only.",
  },
  {
    value: "rebuilt",
    label: "Rebuilt payload",
    description: `Built again with the current schema. Calls from the last ${String(REBUILD_DAYS)} days only.`,
  },
];

export function ResendDialog({
  open,
  onOpenChange,
  title,
  eligible,
  showCounts,
  onResend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  eligible: Record<Payload, number>;
  showCounts: boolean;
  onResend: (payload: Payload) => void;
}) {
  const options = PAYLOADS.filter((option) => eligible[option.value] > 0);
  const [payload, setPayload] = React.useState<Payload>(
    options.at(0)?.value ?? "stored",
  );
  const chosen =
    options.find((option) => option.value === payload)?.value ??
    options.at(0)?.value;
  const count = chosen ? eligible[chosen] : 0;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md!">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Only the webhook is sent. CRM updates and other post-call tasks
            don&apos;t run again.
          </DialogDescription>
        </DialogHeader>

        {options.length > 1 ? (
          <RadioGroup
            aria-label="Payload"
            className="gap-2"
            onValueChange={(value) => {
              const match = options.find((option) => option.value === value);
              if (match) setPayload(match.value);
            }}
            value={chosen}
          >
            {options.map((option) => (
              <FieldLabel
                htmlFor={`payload-${option.value}`}
                key={option.value}
              >
                <Field orientation="horizontal">
                  <RadioGroupItem
                    id={`payload-${option.value}`}
                    value={option.value}
                  />
                  <FieldContent>
                    <FieldTitle>{option.label}</FieldTitle>
                    <FieldDescription>{option.description}</FieldDescription>
                  </FieldContent>
                  {showCounts ? (
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {eligible[option.value].toLocaleString()}
                    </span>
                  ) : null}
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        ) : options.length === 1 ? (
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted px-3 py-2 text-sm">
            <span className="font-medium">{options[0].label}</span>
            <span className="text-muted-foreground">
              {options[0].description}
            </span>
          </div>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!chosen} onClick={() => chosen && onResend(chosen)}>
            {showCounts
              ? `Resend ${count.toLocaleString()} ${count === 1 ? "webhook" : "webhooks"}`
              : "Resend webhook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeliveryBadge({
  code,
  pending,
}: {
  code: number | null;
  pending?: boolean;
}) {
  if (pending) {
    return (
      <Badge variant="outline">
        <Spinner />
        Sending
      </Badge>
    );
  }
  const ok = code !== null && code >= 200 && code < 300;
  return ok ? (
    <Badge className="bg-success-tint text-success-tint-foreground">
      {codeLabel(code)}
    </Badge>
  ) : (
    <Badge variant="destructive">{codeLabel(code)}</Badge>
  );
}
