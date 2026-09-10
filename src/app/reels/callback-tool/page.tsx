import { ReelPage } from "@/components/reels/reel-page"
import {
  CallbackToolReel,
  DURATION,
} from "@/components/reels/callback-tool/reel"

/**
 * `?render=1` is read here, on the server, rather than with `useSearchParams`
 * in the client — it keeps the route out of a Suspense boundary it would
 * otherwise need, and the renderer gets the bare canvas on first paint instead
 * of after a hydration round-trip.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ render?: string }>
}) {
  const { render } = await searchParams

  return (
    <ReelPage
      title="Callback tool"
      eyebrow="Release reel"
      duration={DURATION}
      render={render === "1"}
    >
      <CallbackToolReel />
    </ReelPage>
  )
}
