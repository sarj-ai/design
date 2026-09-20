import { cn } from "@/lib/utils"

/**
 * A logomark for the lab's own chrome.
 *
 * `public/logo.png` is the real thing — the Arabic سرج stacked over sarj.ai —
 * and it is a wordmark: black raster, three times wider than it is tall,
 * illegible at the 28px a nav pill gives it. So this takes the one shape that
 * wordmark repeats and nothing else does: the rhombus that dots the ج, the j
 * and the i, and sits between sarj and ai.
 *
 * Two of them, large over small, in the proportion the wordmark uses for
 * `sarj` and `.ai`. It is not the brand's mark — nobody has drawn one — and it
 * is the lab's chrome rather than a product screen, so it is a stand-in that
 * is at least made of the brand's own geometry.
 */
export function SarjMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
      fill="none"
      viewBox="0 0 32 32"
    >
      <rect className="fill-primary" height="32" rx="9" width="32" />
      {/* The dot of the ج, at the size it carries in the wordmark. */}
      <path
        className="fill-primary-foreground"
        d="M14 6.5 21 14l-7 7.5L7 14z"
      />
      {/* The full stop in sarj.ai — same shape, the step down in scale the
          wordmark already makes between the two lines. */}
      <path
        className="fill-primary-foreground/70"
        d="M23 18.5 27 23l-4 4.5L19 23z"
      />
    </svg>
  )
}
