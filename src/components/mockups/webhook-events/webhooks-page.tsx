"use client";

import * as React from "react";
import { toast } from "sonner";

import { JsonView } from "@/components/design-system/json-view-preview";
import {
  DeleteWebhookIcon,
  LoadFailedIcon,
  RetryLoadIcon,
  SendTestIcon,
  ShowPayloadIcon,
} from "@/components/mockups/webhook-events/icons";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  CREDENTIALS,
  DEFAULT_ON,
  EVENTS,
  GROUPS,
  SAVED_URL,
  type WebhookEvent,
} from "@/lib/mockups/webhook-events-data";

export type WebhookState =
  | "configured"
  | "unset"
  | "read-only"
  | "loading"
  | "error";

const UNSIGNED = "none";
const DEFAULT_HEADER = "Authorization";

function urlError(url: string, source: string): string | null {
  if (url.trim() === "") return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "Enter a full URL, starting with https://";
  }
  if (source !== UNSIGNED && parsed.protocol !== "https:") {
    return "A webhook that sends a credential must use an https URL.";
  }
  return null;
}

export function WebhooksPage({ state }: { state: WebhookState }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <PageHeader title="Webhooks" />
      {state === "loading" ? (
        <LoadingCards />
      ) : state === "error" ? (
        <LoadError />
      ) : (
        <Configuration key={state} state={state} />
      )}
    </main>
  );
}

function Configuration({ state }: { state: WebhookState }) {
  const configured = state !== "unset";
  const canWrite = state !== "read-only";

  const [savedUrl, setSavedUrl] = React.useState(configured ? SAVED_URL : "");
  const [url, setUrl] = React.useState(savedUrl);
  const [source, setSource] = React.useState(
    configured ? CREDENTIALS[0].id : UNSIGNED,
  );
  const [header, setHeader] = React.useState(DEFAULT_HEADER);
  const [touched, setTouched] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(() => new Set(DEFAULT_ON));
  const [deleting, setDeleting] = React.useState(false);

  const hasUrl = savedUrl !== "";
  const error = touched ? urlError(url, source) : null;
  const dirty = url !== savedUrl;

  const save = () => {
    setTouched(true);
    if (url.trim() === "" || urlError(url, source)) return;
    const first = !hasUrl;
    setSavedUrl(url);
    toast.success(first ? "Webhook created" : "Webhook saved");
  };

  const toggle = (event: WebhookEvent, on: boolean) => {
    setSubscribed((current) => {
      const next = new Set(current);
      if (on) next.add(event.type);
      else next.delete(event.type);
      return next;
    });
    toast(on ? `Sending ${event.type}` : `Stopped sending ${event.type}`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="webhook-url">Webhook URL</FieldLabel>
              <Input
                aria-invalid={error ? true : undefined}
                dir="ltr"
                disabled={!canWrite}
                id="webhook-url"
                onBlur={() => setTouched(true)}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://hooks.example.com/sarj"
                value={url}
              />
              {error ? <FieldError>{error}</FieldError> : null}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="webhook-credential">Credential</FieldLabel>
                <Select
                  disabled={!canWrite}
                  onValueChange={setSource}
                  value={source}
                >
                  <SelectTrigger className="w-full" id="webhook-credential">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value={UNSIGNED}>None</SelectItem>
                    {CREDENTIALS.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {entry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {source === UNSIGNED ? null : (
                <Field>
                  <FieldLabel htmlFor="webhook-header">Header name</FieldLabel>
                  <Input
                    dir="ltr"
                    disabled={!canWrite}
                    id="webhook-header"
                    onChange={(event) => setHeader(event.target.value)}
                    value={header}
                  />
                </Field>
              )}
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-2">
          {hasUrl ? (
            <Button
              className="text-destructive"
              disabled={!canWrite}
              onClick={() => setDeleting(true)}
              size="sm"
              variant="ghost"
            >
              <DeleteWebhookIcon />
              Delete webhook
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {hasUrl ? (
              <Button
                disabled={!canWrite}
                onClick={() => toast.success("Test sent · 200 OK")}
                variant="outline"
              >
                <SendTestIcon />
                Send test
              </Button>
            ) : null}
            <Button disabled={!canWrite || !dirty} onClick={save}>
              {hasUrl ? "Save" : "Create webhook"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Each event is its own request to the URL above. Retries keep the
            same <span className="font-mono">event_id</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {GROUPS.map((group) => (
            <section className="flex flex-col gap-2" key={group.id}>
              <h3 className="text-sm font-medium text-muted-foreground">
                {group.label}
              </h3>
              <ItemGroup className="gap-0">
                {EVENTS.filter((event) => event.group === group.id).map(
                  (event) => (
                    <EventRow
                      disabled={!canWrite || !hasUrl}
                      event={event}
                      key={event.type}
                      on={subscribed.has(event.type)}
                      onToggle={(on) => toggle(event, on)}
                    />
                  ),
                )}
              </ItemGroup>
            </section>
          ))}
        </CardContent>
      </Card>

      <AlertDialog onOpenChange={setDeleting} open={deleting}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              Sarj stops sending every event to {savedUrl}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={() => {
                setDeleting(false);
                setSavedUrl("");
                setUrl("");
                setTouched(false);
                toast("Webhook deleted");
              }}
              variant="destructive"
            >
              Delete webhook
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EventRow({
  disabled,
  event,
  on,
  onToggle,
}: {
  disabled: boolean;
  event: WebhookEvent;
  on: boolean;
  onToggle: (on: boolean) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const id = `event-${event.type}`;

  return (
    <Collapsible
      className="border-b last:border-b-0"
      onOpenChange={setOpen}
      open={open}
    >
      <Item className="px-0 max-sm:flex-wrap" size="sm">
        <ItemContent className="max-sm:basis-full">
          <ItemTitle className="font-mono">
            <Label className="font-mono" htmlFor={id}>
              {event.type}
            </Label>
          </ItemTitle>
          <ItemDescription className="line-clamp-none">
            {event.description}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <CollapsibleTrigger asChild>
            <Button size="sm" variant="ghost">
              Payload
              <ShowPayloadIcon
                className={
                  open
                    ? "rotate-180 transition-transform duration-150 ease-out-cubic motion-reduce:transition-none"
                    : "transition-transform duration-150 ease-out-cubic motion-reduce:transition-none"
                }
              />
            </Button>
          </CollapsibleTrigger>
          <Switch
            checked={on}
            disabled={disabled}
            id={id}
            onCheckedChange={onToggle}
          />
        </ItemActions>
      </Item>
      <CollapsibleContent className="pb-4">
        <JsonView value={event.payload} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function LoadingCards() {
  return (
    <>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24 motion-reduce:animate-none" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28 motion-reduce:animate-none" />
          <Skeleton className="h-9 w-full motion-reduce:animate-none" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-20 motion-reduce:animate-none" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {EVENTS.map((event) => (
            <div
              className="flex items-center justify-between gap-4"
              key={event.type}
            >
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-40 motion-reduce:animate-none" />
                <Skeleton className="h-4 w-3/4 motion-reduce:animate-none" />
              </div>
              <Skeleton className="h-5 w-9 motion-reduce:animate-none" />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function LoadError() {
  return (
    <Alert variant="destructive">
      <LoadFailedIcon />
      <AlertTitle>Couldn&apos;t load the webhook</AlertTitle>
      <AlertDescription>
        Your settings haven&apos;t changed. Try again in a moment.
      </AlertDescription>
      <Button className="mt-2 w-fit" size="sm" variant="outline">
        <RetryLoadIcon />
        Try again
      </Button>
    </Alert>
  );
}
