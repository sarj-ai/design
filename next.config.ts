import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // the dev-tools badge sits over the bottom-start corner of every mockup and
  // shows up in review screenshots
  devIndicators: false,
  images: {
    // Next 16 dropped the default from "any quality" to [75], and a `quality`
    // prop outside this list is silently coerced to the nearest entry rather
    // than erroring. The route captures are already webp q82, so re-encoding
    // them at 75 is a second lossy pass over a lossy source.
    qualities: [75, 100],
  },
}

export default nextConfig
