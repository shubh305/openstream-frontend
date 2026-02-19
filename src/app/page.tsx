import Link from "next/link";
import { getLiveStreams } from "@/actions/stream";
import { getVideos } from "@/actions/video";
import { VideoCard } from "@/features/video/components/VideoCard";
import { StreamCard } from "@/components/StreamCard";
import { Play } from "lucide-react";
import { FeaturedHero } from "@/components/FeaturedHero";
import type { Video } from "@/types/api";

export default async function Home() {
  const activeStreamsData = await getLiveStreams({ limit: 4 });
  const streamVodsResponse = await getVideos({ isLive: true, limit: 4, sort: "latest" });
  const latestVideosResponse = await getVideos({ limit: 8, sort: "latest", isLive: false });

  const liveStreams = activeStreamsData;
  const streamVods = streamVodsResponse.videos;
  const latestVideos = latestVideosResponse.videos;

  const featuredContent = liveStreams[0] || streamVods[0] || latestVideos[0];

  return (
    <div className="flex flex-col gap-12 p-6 lg:p-10">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-b border-noir-border pb-12">
        {/* Tagline */}
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black uppercase leading-[0.95] tracking-normal text-foreground">
            Watch,
            <br />
            <span className="text-electric-lime">Stream,</span>
            <br />
            Follow Popular
            <br />
            Creators
          </h1>
          <p className="text-muted-text text-sm max-w-md leading-relaxed">Stream live, watch on demand, and connect with creators.</p>
          <div className="flex gap-4">
            <Link href="/studio/stream" className="inline-flex items-center gap-2 bg-electric-lime text-black px-6 py-3 font-bold text-sm tracking-widest hover:bg-electric-lime/90 transition-colors">
              <Play className="w-4 h-4" />
              Start streaming
            </Link>
          </div>
        </div>

        {/* Featured Video */}
        <div className="relative aspect-video bg-noir-terminal/30 rounded-2xl border border-noir-border overflow-hidden">
          {featuredContent ? (
            <FeaturedHero content={featuredContent} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-noir-terminal flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-muted-text opacity-20" />
              </div>
              <p className="text-muted-text text-sm tracking-widest font-bold">No featured content</p>
            </div>
          )}
        </div>
      </section>

      {/* Live Now (Active Streams) */}
      {liveStreams.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white normal-case not-italic">Live now</h2>
            <Link href="/live" className="text-xs text-muted-text hover:text-white px-5 py-2.5 border border-noir-border rounded-full transition-colors tracking-widest font-bold">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveStreams.map(stream => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        </section>
      )}

      {/* Stream Highlights */}
      <VideoRow title="Stream highlights" videos={streamVods} emptyMessage="No stream highlights yet" />

      {/* Latest Uploads */}
      <VideoRow title="Latest uploads" videos={latestVideos} />
    </div>
  );
}

interface VideoRowProps {
  title: string;
  videos: Video[];
  emptyMessage?: string;
}

function VideoRow({ title, videos, emptyMessage = "No videos found" }: VideoRowProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white normal-case not-italic">{title}</h2>
        <Link href="/videos" className="text-xs text-muted-text hover:text-white px-5 py-2.5 border border-noir-border rounded-full transition-colors tracking-widest font-bold">
          View all
        </Link>
      </div>
      {videos.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center border border-noir-border rounded-xl bg-noir-terminal/50 text-center">
          <p className="text-sm font-medium text-foreground tracking-widest">{emptyMessage}</p>
          <p className="text-xs text-muted-text mt-1">Check back later for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.slice(0, 4).map(video => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      )}
    </section>
  );
}
