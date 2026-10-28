import Image from "next/image"

import { cn } from "@/lib/utils"

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
