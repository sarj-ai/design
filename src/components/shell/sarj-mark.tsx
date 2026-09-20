import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * The lab's logomark, in the nav pill on every page.
 *
 * A stack of four tiles on a rounded square, in the brand purples: the
 * index's grid of screens, more or less. It is the lab's own mark rather than
 * the product's — `public/logo.png` is still the Sarj wordmark, and it stays
 * inside the mockups' app shell, where the product's chrome belongs.
 *
 * A raster, because that is what was drawn. `public/mark.png` is the source
 * cropped to its visible bounds and sized for the 28px it is shown at, up to
 * a 4x screen; `src/app/icon.png` and `apple-icon.png` are the same mark for
 * the tab and the home screen. Unoptimized: it is already the size it needs
 * to be, and a re-encode would only soften its edges.
 */
export function SarjMark({ className }: { className?: string }) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
      height={28}
      src="/mark.png"
      unoptimized
      width={28}
    />
  )
}
