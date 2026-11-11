"use client";

import * as React from "react";

import { FieldHint } from "@/components/design-system/field-hint";
import { HintIcon } from "@/components/design-system/icons";
import {
  CloseIcon,
  ResetIcon,
} from "@/components/mockups/scenario-advanced-settings/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PROMPT_SECTIONS,
  countChanges,
  format,
  valueOf,
  type Draft,
  type NumberSetting,
  type Overrides,
  type SettingGroup,
} from "@/lib/mockups/scenario-advanced-settings-data";

export type DrawerTarget =
  | { kind: "group"; group: SettingGroup }
  | { kind: "prompt" }
  | null;

type TextValues = Partial<Record<string, string>>;

const PERMISSION_HINT =
  "Anyone who can edit this scenario sees these. Changing them needs the Override advanced settings permission.";

export function SettingsDrawer({
  target,
  draft,
  canOverride,
  onApply,
  onClose,
}: {
  target: DrawerTarget;
  draft: Draft;
  canOverride: boolean;
  onApply: (next: Draft) => void;
  onClose: () => void;
}) {
  const open = target !== null;
  const [shown, setShown] = React.useState<Exclude<DrawerTarget, null>>({
    kind: "prompt",
  });
  const [text, setText] = React.useState<TextValues>({});
  const [excluded, setExcluded] = React.useState<string[]>([]);
  const [confirming, setConfirming] = React.useState(false);
  const [loaded, setLoaded] = React.useState<DrawerTarget>(null);
  if (target !== loaded) {
    setLoaded(target);
    if (target) {
      setShown(target);
      setExcluded(draft.excluded);
      if (target.kind === "group")
        setText(initialText(target.group.settings, draft));
    }
  }

  const settings = shown.kind === "group" ? shown.group.settings : [];
  const errors = validate(shown, settings, text);
  const invalid = Object.values(errors).some(Boolean);

  const next: Draft = {
    overrides: applyEdits(draft.overrides, settings, text),
    excluded,
  };
  const dirty = countChanges(draft, next) > 0;

  function requestClose() {
    if (dirty) setConfirming(true);
    else onClose();
  }

  const basic = settings.filter((setting) => setting.tier === "basic");
  const advanced = settings.filter((setting) => setting.tier === "advanced");

  const title = shown.kind === "group" ? shown.group.title : "Global prompt";
  const description =
    shown.kind === "group"
      ? shown.group.description
      : "The shared sections added to this scenario's prompt on every call.";

  return (
    <>
      <Drawer
        direction="right"
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) requestClose();
        }}
      >
        <DrawerContent className="sm:max-w-md!">
          <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
            <div className="flex flex-col gap-0.5">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </div>
            <Button
              aria-label="Close"
              size="icon-sm"
              variant="ghost"
              onClick={requestClose}
            >
              <CloseIcon />
            </Button>
          </DrawerHeader>

          <div
            className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4"
            data-vaul-no-drag
          >
            {shown.kind === "group" ? (
              <>
                {basic.length > 0 ? (
                  <FieldGroup>
                    {basic.map((setting) => (
                      <NumberField
                        key={setting.id}
                        setting={setting}
                        text={text[setting.id] ?? ""}
                        error={errors[setting.id]}
                        disabled={false}
                        onChange={(value) =>
                          setText({ ...text, [setting.id]: value })
                        }
                      />
                    ))}
                  </FieldGroup>
                ) : null}

                {basic.length > 0 && advanced.length > 0 ? (
                  <FieldSeparator />
                ) : null}

                {advanced.length > 0 ? (
                  <FieldSet>
                    <AdvancedLegend />
                    <FieldGroup>
                      {advanced.map((setting) => (
                        <NumberField
                          key={setting.id}
                          setting={setting}
                          text={text[setting.id] ?? ""}
                          error={errors[setting.id]}
                          disabled={!canOverride}
                          onChange={(value) =>
                            setText({ ...text, [setting.id]: value })
                          }
                        />
                      ))}
                    </FieldGroup>
                  </FieldSet>
                ) : null}
              </>
            ) : (
              <FieldSet>
                <AdvancedLegend />
                <ItemGroup className="gap-2">
                  {PROMPT_SECTIONS.map((section) => {
                    const on = !excluded.includes(section.id);
                    const id = `section-${section.id}`;
                    return (
                      <Item key={section.id} size="sm" variant="outline">
                        <ItemContent>
                          <ItemTitle>
                            <Label htmlFor={id}>{section.name}</Label>
                          </ItemTitle>
                          <ItemDescription>
                            {section.languages.join(", ")}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <Switch
                            checked={on}
                            disabled={!canOverride}
                            id={id}
                            onCheckedChange={(checked) =>
                              setExcluded(
                                checked
                                  ? excluded.filter(
                                      (entry) => entry !== section.id,
                                    )
                                  : [...excluded, section.id],
                              )
                            }
                          />
                        </ItemActions>
                      </Item>
                    );
                  })}
                </ItemGroup>
              </FieldSet>
            )}
          </div>

          <DrawerFooter className="flex-row justify-end gap-2 border-t">
            <Button variant="outline" onClick={requestClose}>
              Cancel
            </Button>
            <Button disabled={!dirty || invalid} onClick={() => onApply(next)}>
              Apply changes
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your edits to {title.toLowerCase()} will be lost. The scenario
              keeps its current values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirming(false);
                onClose();
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AdvancedLegend() {
  return (
    <div className="flex items-center gap-1.5">
      <FieldLegend className="mb-0" variant="label">
        Advanced
      </FieldLegend>
      <Tooltip>
        <TooltipTrigger
          aria-label="About advanced settings"
          className="rounded-full text-muted-foreground/70 transition-colors duration-150 ease-out-cubic outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
          type="button"
        >
          <HintIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent
          align="start"
          className="text-balance"
          side="top"
          sideOffset={4}
        >
          {PERMISSION_HINT}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function NumberField({
  setting,
  text,
  error,
  disabled,
  onChange,
}: {
  setting: NumberSetting;
  text: string;
  error: string | null;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const changed = text !== "" && Number(text) !== setting.defaultValue;

  return (
    <Field
      data-disabled={disabled || undefined}
      data-invalid={Boolean(error) || undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <FieldHint hint={setting.hint} htmlFor={setting.id}>
          {setting.label}
        </FieldHint>
        {changed && !disabled ? (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => onChange(String(setting.defaultValue))}
          >
            <ResetIcon data-icon="inline-start" />
            Reset to {format(setting, setting.defaultValue)}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {changed
              ? `Default ${format(setting, setting.defaultValue)}`
              : "Default"}
          </span>
        )}
      </div>
      <InputGroup data-disabled={disabled || undefined}>
        <InputGroupInput
          aria-invalid={Boolean(error) || undefined}
          disabled={disabled}
          id={setting.id}
          inputMode="decimal"
          max={setting.max}
          min={setting.min}
          step={setting.step}
          type="number"
          value={text}
          onChange={(event) => onChange(event.target.value)}
        />
        {setting.unit ? (
          <InputGroupAddon align="inline-end">
            <InputGroupText>{setting.unit}</InputGroupText>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

function problem(setting: NumberSetting, text: string | undefined) {
  if (text === undefined) return null;
  const value = Number(text);
  if (text.trim() === "" || Number.isNaN(value))
    return `Enter a number from ${format(setting, setting.min)} to ${format(setting, setting.max)}`;
  if (value < setting.min || value > setting.max)
    return `Use ${format(setting, setting.min)} to ${format(setting, setting.max)}`;
  return null;
}

function initialText(
  settings: readonly NumberSetting[],
  draft: Draft,
): TextValues {
  return Object.fromEntries(
    settings.map((setting) => [
      setting.id,
      String(valueOf(draft.overrides, setting)),
    ]),
  );
}

function validate(
  shown: Exclude<DrawerTarget, null>,
  settings: readonly NumberSetting[],
  text: TextValues,
) {
  const errors = Object.fromEntries(
    settings.map((setting) => [setting.id, problem(setting, text[setting.id])]),
  );
  if (shown.kind === "group" && shown.group.id === "cues") {
    const min = Number(text["cues.gapMin"]);
    const max = Number(text["cues.gapMax"]);
    if (!errors["cues.gapMax"] && !errors["cues.gapMin"] && min > max)
      errors["cues.gapMax"] = "Can't be shorter than the shortest gap";
  }
  return errors;
}

function applyEdits(
  overrides: Overrides,
  settings: readonly NumberSetting[],
  text: TextValues,
): Overrides {
  const result = new Map(Object.entries(overrides));
  for (const setting of settings) {
    const value = parsedValue(setting, text);
    if (value === null) continue;
    if (value === setting.defaultValue) result.delete(setting.id);
    else result.set(setting.id, value);
  }
  return Object.fromEntries(result);
}

function parsedValue(setting: NumberSetting, text: TextValues) {
  const raw = text[setting.id];
  if (raw === undefined) return null;
  const value = Number(raw);
  return Number.isNaN(value) ? null : value;
}
