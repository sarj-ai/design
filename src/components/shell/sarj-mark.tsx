import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * The Sarj logo, in the nav pill on every page.
 *
 * The same `public/logo.png` and the same 56×32 the mockups' app shell
 * renders in its sidebar, which is the size the product's own header uses.
 * The link around it carries the name, so the image itself is decorative.
 */
export function SarjMark({ className }: { className?: string }) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={cn("h-8 w-14 shrink-0", className)}
      height={32}
      src="/logo.png"
      width={56}
    />
  )
}
