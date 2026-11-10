"use client";

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ReviewerSwitch<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <>
      <ToggleGroup
        aria-label={label}
        className="max-sm:hidden"
        onValueChange={(next) => {
          const match = options.find((entry) => entry.id === next);
          if (match) onChange(match.id);
        }}
        size="sm"
        type="single"
        value={value}
        variant="outline"
      >
        {options.map((entry) => (
          <ToggleGroupItem key={entry.id} value={entry.id}>
            {entry.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <NativeSelect
        aria-label={label}
        className="sm:hidden"
        onChange={(event) => {
          const match = options.find(
            (entry) => entry.id === event.target.value,
          );
          if (match) onChange(match.id);
        }}
        size="sm"
        value={value}
      >
        {options.map((entry) => (
          <NativeSelectOption key={entry.id} value={entry.id}>
            {entry.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </>
  );
}
