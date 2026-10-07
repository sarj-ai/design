import { VideoReelPage } from "@/components/reels/video-reel-page"
import { reelAt } from "@/lib/site/reels-data"

export default function Page() {
  return <VideoReelPage reel={reelAt("/reels/sarj-motion")} />
}
