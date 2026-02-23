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
    <div className="flex flex-col gap-8 md:gap-12 p-4 md:p-8 lg:p-12 xl:p-16 max-w-[1700px] mx-auto w-full">
      {/* Hero Section */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center border-b border-white/5 pb-16 lg:pb-24">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-electric-lime/[0.01] rounded-full pointer-events-none -z-10" />

        {/* Tagline */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-8 text-center lg:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="w-1 h-1 rounded-full bg-electric-lime animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Next-Gen Streaming</span>
          </div>
          <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-black uppercase leading-[0.9] tracking-tighter text-white max-w-2xl mx-auto lg:mx-0">
            Watch, <span className="text-electric-lime">Stream,</span> <br className="hidden lg:block" /> Follow Popular Creators
          </h1>
          <p className="text-muted-text text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
            Immerse yourself in live broadcasts and connect with the next generation of creative icons.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/studio/stream"
              className="inline-flex items-center justify-center gap-3 bg-electric-lime text-black px-10 py-5 font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-2xl shadow-electric-lime/20 group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              Start streaming
            </Link>
            <Link
              href="/videos"
              className="inline-flex items-center justify-center gap-3 bg-white/5 text-white border border-white/10 px-10 py-5 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
            >
              Explore Feed
            </Link>
          </div>
        </div>

        {/* Featured Content */}
        <div className="lg:col-span-6 xl:col-span-7 relative aspect-video bg-noir-terminal/30 rounded-3xl border border-white/5 overflow-hidden w-full shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-tr from-electric-lime/[0.02] to-transparent pointer-events-none group-hover:opacity-50 transition-opacity" />
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
            <h2 className="text-lg md:text-xl font-bold text-white normal-case not-italic">Live now</h2>
            <Link
              href="/live"
              className="text-[10px] md:text-xs text-muted-text hover:text-white px-4 md:px-5 py-2 md:py-2.5 border border-noir-border rounded-full transition-colors tracking-widest font-bold"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
        <h2 className="text-lg md:text-xl font-bold text-white normal-case not-italic">{title}</h2>
        <Link
          href="/videos"
          className="text-[10px] md:text-xs text-muted-text hover:text-white px-4 md:px-5 py-2 md:py-2.5 border border-noir-border rounded-full transition-colors tracking-widest font-bold"
        >
          View all
        </Link>
      </div>
      {videos.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center border border-noir-border rounded-xl bg-noir-terminal/50 text-center px-4">
          <p className="text-sm font-medium text-foreground tracking-widest">{emptyMessage}</p>
          <p className="text-xs text-muted-text mt-1">Check back later for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {videos.slice(0, 5).map(video => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnailUrl={video.thumbnailUrl}
              duration={video.duration}
              views={video.views}
              uploadedAt={video.uploadedAt}
              creator={video.creator}
              isLive={video.isLive}
              status={video.status}
              resolutions={video.resolutions}
            />
          ))}
        </div>
      )}
    </section>
  );
}
