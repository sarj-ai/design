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
} from "@/lib/transfer-routing-data"
import { WorkingHoursFields } from "@/components/transfer-routing/route-card"

/**
 * What every route does unless it says otherwise.
 *
 * Most clients run one team behind all their routes, so these start shared and
 * a route only takes one off the block when it genuinely differs. The trunk is
 * the exception — the call leaves on one carrier whatever route picked it.
 */
export function SharedSettings({
  value,
  warmInUse,
  onChange,
}: {
  value: SharedSettingsValue
  /**
   * Any route transfers warm, shared or overridden. A route that overrode
   * itself to warm still inherits this prompt, so hiding it whenever the
   * shared mode is cold left that route pointing at a value with no control.
   */
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
          <SelectContent>
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
        {/* Three controls under one heading. Without the inset they read as
            three more peers of Transfer mode rather than parts of the hours. */}
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
          <SelectContent>
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
