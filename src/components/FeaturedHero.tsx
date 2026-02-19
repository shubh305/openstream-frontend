"use client";

import Link from "next/link";
import Image from "next/image";
import type { Stream, Video } from "@/types/api";
import { LiveVideoPlayer } from "@/components/LiveVideoPlayer";

import { StreamThumbnail } from "@/components/StreamThumbnail";

interface FeaturedHeroProps {
  content: Stream | Video;
}

export function FeaturedHero({ content }: FeaturedHeroProps) {
  const isVideo = "isLive" in content;
  const isStream = "status" in content;

  const isCurrentlyLive = isStream && content.status === "live";
  const isStreamVod = isVideo && (content as Video).isLive;

  const playbackUrl = isStream ? (content as Stream).hlsPlaybackUrl : (content as Video).videoUrl;
  const hasRealHlsUrl = playbackUrl?.endsWith(".m3u8") ?? false;

  const streamerInfo = isStream ? (content as Stream).streamer || (content as Stream).creator : null;
  const videoCreator = isVideo ? (content as Video).creator : null;

  const href = isCurrentlyLive ? `/live/${streamerInfo?.username || content.id}` : `/watch/${content.id}`;

  const creatorName = streamerInfo?.username || videoCreator?.username || "Unknown";
  const avatarUrl = streamerInfo?.avatarUrl || videoCreator?.avatarUrl;

  // If it's a live stream with a REAL HLS URL, show the video player
  if (isCurrentlyLive && hasRealHlsUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-noir-border bg-noir-terminal group h-full w-full">
        <LiveVideoPlayer hlsUrl={playbackUrl!} poster={content.thumbnailUrl || ""} autoplay={true} />
        {/* Creator info overlay */}
        <Link href={href} className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20 hover:from-black/95 transition-colors">
          <div className="flex items-center gap-3">
            {avatarUrl && <Image src={avatarUrl} alt={creatorName} width={40} height={40} className="rounded-full" />}
            <div>
              <h3 className="text-white font-bold text-lg line-clamp-1">{content.title}</h3>
              <p className="text-muted-text text-sm">{creatorName}</p>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-noir-border bg-noir-terminal group h-full w-full">
      <Link href={href} className="block h-full w-full">
        <div className="h-full w-full relative">
          <StreamThumbnail url={content.thumbnailUrl} title={content.title} className="w-full h-full" />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

          {/* Live Badge */}
          {isCurrentlyLive ? (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-signal-red px-3 py-1.5 rounded-full animate-pulse z-30">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Live Now</span>
            </div>
          ) : isStreamVod ? (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-noir-terminal/80 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-full z-30">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Stream</span>
            </div>
          ) : null}

          {/* Video Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg line-clamp-2">{content.title}</h3>
            <p className="text-muted-text text-sm mt-1">{creatorName}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
