import Link from "next/link";
import Image from "next/image";
import { getLiveStreams } from "@/actions/stream";
import { getVideos } from "@/actions/video";
import { VideoCard } from "@/features/video/components/VideoCard";
import { Play } from "lucide-react";
import { DUMMY_VIDEOS, DUMMY_STREAMS } from "@/lib/dummy-data";

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

        {/* Featured Video */}
        {featuredContent && (
          <div className="relative rounded-2xl overflow-hidden border border-noir-border bg-noir-terminal group">
            <Link href={featuredContent.status === "live" ? `/live/${featuredContent.streamer.username}` : `/watch/${featuredContent.id}`}>
              <div className="aspect-video relative">
                <Image src={featuredContent.thumbnailUrl || "/placeholder.jpg"} alt={featuredContent.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Live Badge / Countdown */}
                {featuredContent.status === "live" && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-signal-red px-3 py-1.5 rounded-full animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span className="text-xs font-bold text-white uppercase">Live Now</span>
                  </div>
                )}

                {/* Video Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg line-clamp-2">{featuredContent.title}</h3>
                  <p className="text-muted-text text-sm mt-1">
                    {"status" in featuredContent ? (featuredContent as import("@/types/api").Stream).streamer.username : (featuredContent as import("@/types/api").Video).creator.username}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </section>

      {/* Streams of the Day */}
      {liveStreams.length > 0 && <VideoRow title="Streams of the day" videos={liveStreams} type="stream" />}

      {/* Latest Uploads */}
      <VideoRow title="Latest uploads" videos={uploadedVideos} />
    </div>
  );
}

interface VideoRowProps {
  title: string;
  videos: (import("@/types/api").Video | import("@/types/api").Stream)[];
  type?: "video" | "stream";
}

function VideoRow({ title, videos, type }: VideoRowProps) {
  if (videos.length === 0) return null;

  const viewAllLink = type === "stream" ? "/live" : "/videos";

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <Link href={viewAllLink} className="text-xs text-muted-text hover:text-white px-4 py-2 border border-noir-border rounded-full transition-colors">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.slice(0, 4).map(item => {
          const isStream = "status" in item;

          if (isStream) {
            const stream = item as import("@/types/api").Stream;
            return (
              <VideoCard
                key={stream.id}
                id={stream.id}
                title={stream.title}
                thumbnailUrl={stream.thumbnailUrl || "/placeholder.jpg"}
                duration="LIVE"
                views={stream.viewerCount}
                uploadedAt="Live"
                isLive={true}
                creator={stream.streamer}
              />
            );
          } else {
            const video = item as import("@/types/api").Video;
            return <VideoCard key={video.id} {...video} />;
          }
        })}
      </div>
    </section>
  );
}
