import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  images: {
    // A `quality` prop outside this list is silently coerced to the nearest entry.
    qualities: [75, 100],
  },
  turbopack: {
    rules: {
      // Raw import: the Worker has no file system, so .md cannot be read from disk at runtime.
      "*.md": { type: "raw" },
    },
  },
}

export default nextConfig
