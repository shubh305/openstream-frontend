import Link from "next/link";
import { getLiveStreams } from "@/actions/stream";
import { getVideos } from "@/actions/video";
import { VideoCard } from "@/features/video/components/VideoCard";
import { StreamCard } from "@/components/StreamCard";
import { Play } from "lucide-react";
import { FeaturedHero } from "@/components/FeaturedHero";
import type { Stream, Video } from "@/types/api";

export default async function Home() {
  const liveStreamsData = await getLiveStreams({ limit: 4 });
  const latestVideosResponse = await getVideos({ limit: 8, sort: "latest" });

  const liveStreams = liveStreamsData;
  const latestVideos = latestVideosResponse.videos;

  const featuredContent = liveStreams[0] || latestVideos[0];
  const uploadedVideos = latestVideos;

  return (
    <div className="flex flex-col gap-12 p-6 lg:p-10">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-b border-noir-border pb-12">
        {/* Tagline */}
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black uppercase leading-[0.95] tracking-tight text-foreground">
            Watch,
            <br />
            <span className="text-electric-lime">Stream,</span>
            <br />
            Follow Popular
            <br />
            Creators
          </h1>
          <p className="text-muted-text text-sm max-w-md leading-relaxed">Stream live, watch on demand, and connect with creators.</p>
          <Link
            href="/studio/stream"
            className="inline-flex items-center gap-2 bg-electric-lime text-black px-6 py-3 font-bold text-sm uppercase tracking-widest hover:bg-electric-lime/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Streaming
          </Link>
        </div>

        {/* Featured Video - Now with live video player support */}
        <div className="relative aspect-video bg-noir-terminal/30 rounded-2xl border border-noir-border overflow-hidden">
          {featuredContent ? (
            <FeaturedHero content={featuredContent} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-noir-terminal flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-muted-text opacity-20" />
              </div>
              <p className="text-muted-text text-sm uppercase tracking-widest font-bold">No featured content</p>
            </div>
          )}
        </div>
      </section>

      {/* Streams of the Day */}
      <StreamRow title="Streams of the day" streams={liveStreams} />

      {/* Latest Uploads */}
      <VideoRow title="Latest uploads" videos={uploadedVideos} />
    </div>
  );
}

interface StreamRowProps {
  title: string;
  streams: Stream[];
}

function StreamRow({ title, streams }: StreamRowProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white uppercase tracking-tighter italic">{title}</h2>
        <Link href="/live" className="text-xs text-muted-text hover:text-white px-4 py-2 border border-noir-border rounded-full transition-colors uppercase tracking-widest font-bold">
          View all
        </Link>
      </div>

      {streams.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center border border-noir-border rounded-xl bg-noir-terminal/50 text-center">
          <p className="text-sm font-medium text-foreground uppercase tracking-widest">No live streams right now</p>
          <p className="text-xs text-muted-text mt-1">Check back later for new live content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {streams.slice(0, 4).map(stream => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      )}
    </section>
  );
}

interface VideoRowProps {
  title: string;
  videos: Video[];
}

function VideoRow({ title, videos }: VideoRowProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white uppercase tracking-tighter italic">{title}</h2>
        <Link href="/videos" className="text-xs text-muted-text hover:text-white px-4 py-2 border border-noir-border rounded-full transition-colors uppercase tracking-widest font-bold">
          View all
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center border border-noir-border rounded-xl bg-noir-terminal/50 text-center">
          <p className="text-sm font-medium text-foreground uppercase tracking-widest">No videos found</p>
          <p className="text-xs text-muted-text mt-1">Check back later for new community uploads!</p>
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
