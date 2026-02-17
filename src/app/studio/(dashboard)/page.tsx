import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/actions/auth";
import { getChannelByHandle } from "@/actions/channel";
import { getVideos } from "@/actions/video";
import Image from "next/image";

export default async function StudioDashboardPage() {
  const session = await getSession();
  const username = session?.user?.username;

  const [channel] = await Promise.all([
    username ? getChannelByHandle(username) : null,
  ]);
  
  let realLatestVideo = null;
  if (channel) {
     const v = await getVideos({ channelId: channel.id, limit: 1, sort: "latest" });
     if (v.videos.length > 0) realLatestVideo = v.videos[0];
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Channel dashboard</h1>
        <div className="flex gap-3">
          <Link href="/studio/stream">
            <Button variant="outline" className="gap-2">
              <div className="w-2 h-2 rounded-full bg-signal-red animate-pulse" />
              Go Live
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="gap-2 bg-foreground text-background hover:bg-electric-lime">
              <Upload className="w-4 h-4" />
              Upload videos
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Latest Video Performance */}
        <div className="rounded-xl border border-noir-border bg-noir-terminal p-6 space-y-6">
          <h2 className="text-lg font-medium text-foreground">Latest video performance</h2>

          {realLatestVideo ? (
            <>
              <div className="relative aspect-video bg-noir-bg border border-noir-border rounded-lg overflow-hidden group">
                <Image src={realLatestVideo.thumbnailUrl} alt={realLatestVideo.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link href={`/watch/${realLatestVideo.id}`}>
                    <Button variant="outline" size="sm" className="bg-background text-foreground hover:bg-electric-lime">
                      Watch
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white truncate">{realLatestVideo.title}</p>
                <p className="text-xs text-muted-text mt-1">Uploaded {realLatestVideo.uploadedAt}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center border-t border-noir-border pt-4">
                <div>
                  <div className="text-xl font-bold text-foreground">{realLatestVideo.views}</div>
                  <div className="text-[10px] text-muted-text uppercase">Views</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{realLatestVideo.likes || 0}</div>
                  <div className="text-[10px] text-muted-text uppercase">Likes</div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-text text-sm italic">No videos uploaded yet.</div>
          )}
        </div>

        {/* Channel Analytics */}
        <div className="rounded-xl border border-noir-border bg-noir-terminal p-6 space-y-6">
          <h2 className="text-lg font-medium text-foreground">Channel analytics</h2>

          <div className="space-y-1">
            <div className="text-sm text-muted-text">Current subscribers</div>
            <div className="text-4xl font-bold text-foreground tracking-tight">{channel?.subscriberCount || 0}</div>
            <div className="text-xs text-electric-lime">Lifetime</div>
          </div>

          <div className="pt-6 border-t border-noir-border space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Summary</div>
              <div className="text-xs text-muted-text">Lifetime</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-text">Total Views</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{channel?.totalViews.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-text">Total Videos</div>
                <span className="text-sm font-bold text-foreground">{channel?.videoCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-noir-border bg-noir-terminal p-6 space-y-6">
          <h2 className="text-lg font-medium text-foreground">Recent subscribers</h2>

          <div className="h-40 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-sm text-muted-text">Real-time subscriber list coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
