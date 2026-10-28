"use client"

import * as React from "react"

import { FieldHint } from "@/components/design-system/field-hint"
import { FieldError, FieldLabel } from "@/components/ui/field"

export function FieldHeader({
  children,
  htmlFor,
  hint,
  error,
}: {
  children: React.ReactNode
  htmlFor: string
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
