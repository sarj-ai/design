import { ReelPage } from "@/components/reels/reel-page"
import {
  CallbackToolReel,
  DURATION,
} from "@/components/reels/callback-tool/reel"

/** Read `?render=1` on the server, not with useSearchParams, so the route needs no Suspense boundary and the renderer gets the bare canvas on first paint. */
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
