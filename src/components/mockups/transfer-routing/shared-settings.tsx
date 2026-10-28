"use client"

import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  OUTBOUND_TRUNKS,
  TRANSFER_MODES,
  type SharedSettings as SharedSettingsValue,
  type TransferMode,
} from "@/lib/mockups/transfer-routing-data"
import { WorkingHoursFields } from "@/components/mockups/transfer-routing/route-card"

export function SharedSettings({
  value,
  warmInUse,
  onChange,
}: {
  value: SharedSettingsValue
  /** Any route can transfer warm, and a route overridden to warm still inherits this prompt. */
  warmInUse: boolean
  onChange: (next: SharedSettingsValue) => void
}) {
  function patch(next: Partial<SharedSettingsValue>) {
    onChange({ ...value, ...next })
  }

  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldTitle>Transfer mode</FieldTitle>
        <Select
          value={value.transferMode}
          onValueChange={(mode) =>
            patch({ transferMode: mode as TransferMode })
          }
        >
          <SelectTrigger id="shared-mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {TRANSFER_MODES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="shared-message">
          Message before transferring
        </FieldLabel>
        <Textarea
          id="shared-message"
          rows={2}
          value={value.messageBeforeTransfer}
          onChange={(event) =>
            patch({ messageBeforeTransfer: event.target.value })
          }
        />
      </Field>

      <Field>
        <FieldTitle>Working hours</FieldTitle>
        <div className="rounded-lg bg-muted p-4">
          <WorkingHoursFields
            value={value.workingHours}
            idPrefix="shared"
            onChange={(workingHours) => patch({ workingHours })}
          />
        </div>
      </Field>

      {warmInUse ? (
        <Field>
          <FieldLabel htmlFor="shared-summary">Warm summary prompt</FieldLabel>
          <Textarea
            id="shared-summary"
            rows={3}
            value={value.warmSummaryPrompt}
            onChange={(event) =>
              patch({ warmSummaryPrompt: event.target.value })
            }
          />
        </Field>
      ) : null}

      <Field>
        <FieldLabel htmlFor="shared-trunk">Preferred outbound trunk</FieldLabel>
        <Select
          value={value.outboundTrunk}
          onValueChange={(outboundTrunk) => patch({ outboundTrunk })}
        >
          <SelectTrigger id="shared-trunk">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {OUTBOUND_TRUNKS.map((trunk) => (
              <SelectItem key={trunk} value={trunk}>
                {trunk}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          Every route dials out on this trunk. It can&apos;t be set per route.
        </FieldDescription>
      </Field>
    </div>
  )
}
