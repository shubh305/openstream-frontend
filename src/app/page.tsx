import Link from "next/link";
import { getLiveStreams } from "@/actions/stream";
import { getVideos } from "@/actions/video";
import { VideoCard } from "@/features/video/components/VideoCard";
import { StreamCard } from "@/components/StreamCard";
import { Play } from "lucide-react";
import { DUMMY_VIDEOS, DUMMY_STREAMS } from "@/lib/dummy-data";
import { FeaturedHero } from "@/components/FeaturedHero";
import type { Stream, Video } from "@/types/api";

export default async function Home() {
  const liveStreamsData = await getLiveStreams({ limit: 4 });
  const latestVideosResponse = await getVideos({ limit: 8, sort: "latest" });

  // FALLBACK: Use dummy data if backend is empty
  const liveStreams = liveStreamsData.length > 0 ? liveStreamsData : DUMMY_STREAMS;
  const latestVideos = latestVideosResponse.videos.length > 0 ? latestVideosResponse.videos : DUMMY_VIDEOS;

  const featuredContent = liveStreams[0] || latestVideos[0];
  const uploadedVideos = latestVideos;

  return (
    <div className="flex flex-col gap-12 p-6 lg:p-10">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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
        {featuredContent && <FeaturedHero content={featuredContent} />}
      </section>

      {/* Streams of the Day */}
      {liveStreams.length > 0 && <StreamRow title="Streams of the day" streams={liveStreams} />}

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
  if (streams.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <Link href="/live" className="text-xs text-muted-text hover:text-white px-4 py-2 border border-noir-border rounded-full transition-colors">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {streams.slice(0, 4).map(stream => (
          <StreamCard key={stream.id} stream={stream} />
        ))}
      </div>
    </section>
  );
}

interface VideoRowProps {
  title: string;
  videos: Video[];
}

function VideoRow({ title, videos }: VideoRowProps) {
  if (videos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <Link href="/videos" className="text-xs text-muted-text hover:text-white px-4 py-2 border border-noir-border rounded-full transition-colors">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.slice(0, 4).map(video => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
    </section>
  );
}
