"use client"

import * as React from "react"

import { FieldHint } from "@/components/design-system/field-hint"
import { FieldError, FieldLabel } from "@/components/ui/field"

/**
 * A field's label line: the label, its (i) when it has one, and — when the
 * field is wrong — the error at the end of the same line.
 *
 * The error used to take a line of its own between the label and the box.
 * That kept it above the control, but it pushed the box down by a line, so in
 * a row of fields the one in trouble dropped out of line with its neighbours
 * and the whole form shifted the moment Create was pressed. On the label's
 * line it costs no height: the box stays where the reader left it, and the
 * message is still the first thing read after the field's name.
 *
 * The label keeps its own colour; the border and this message carry the
 * state. Keep messages short enough for the line — an instruction of a few
 * words ("Name the voice."). A long one wraps under itself at the end of the
 * line rather than pushing the label.
 *
 * Point the control at the message with `aria-describedby={errorId(id)}`.
 */
export function FieldHeader({
  children,
  htmlFor,
  hint,
  error,
}: {
  /** The label text. */
  children: React.ReactNode
  htmlFor: string
  /** An (i) explanation, for drawers and dialogs — see `FieldHint`. */
  hint?: string
  error?: string | null
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      {hint ? (
        <FieldHint hint={hint} htmlFor={htmlFor}>
          {children}
        </FieldHint>
      ) : (
        <FieldLabel htmlFor={htmlFor}>{children}</FieldLabel>
      )}
      {error ? (
        <FieldError className="text-end" id={errorId(htmlFor)}>
          {error}
        </FieldError>
      ) : null}
    </div>
  )
}

export function errorId(htmlFor: string) {
  return `${htmlFor}-error`
}
