import Link from "next/link";

import { FooterMark } from "@/components/shell/footer-mark";
import { SarjMark } from "@/components/shell/sarj-mark";
import { SITE_PLACES } from "@/components/shell/site-nav";

/**
 * The index's footer, after AlignUI's: the places in the lab, a hairline with square
 * end caps, the copyright, and the wordmark drawn in outline at display size, fading
 * out at the foot of the page.
 */
export function SiteFooter() {
  return (
    <footer className="mt-16 flex w-full flex-col items-center gap-8 overflow-hidden">
      <div className="@container mx-auto flex w-full max-w-5xl flex-col gap-8 px-8">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <SarjMark />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sarj. Design lab.
            </p>
          </div>
          <nav aria-label="Lab" className="flex flex-wrap items-center gap-6">
            {SITE_PLACES.map((place) => (
              <Link
                className="text-sm text-muted-foreground transition-colors duration-150 ease-out-cubic hover:text-foreground motion-reduce:transition-none"
                href={place.href}
                key={place.href}
              >
                {place.label}
              </Link>
            ))}
          </nav>
        </div>

        <div aria-hidden className="footer-rule w-full" />

        <FooterMark />
      </div>
    </footer>
  );
}
