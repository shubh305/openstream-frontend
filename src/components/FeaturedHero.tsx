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

  const views = isStream ? (content as Stream).viewerCount : (content as Video).views;

  const viewsLabel =
    views !== undefined ? (
      <div className="flex items-center gap-3">
        <p className="text-white/70 text-sm md:text-base font-medium">{creatorName}</p>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <p className="text-white/50 text-xs md:text-sm font-medium">
          {Intl.NumberFormat("en-US", { notation: "compact" }).format(views)}
          {isStream ? " viewers" : " views"}
        </p>
      </div>
    ) : (
      <p className="text-white/70 text-sm md:text-base font-medium">{creatorName}</p>
    );

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-noir-deep group h-full w-full">
      <Link href={href} className="block h-full w-full relative overflow-hidden">
        <StreamThumbnail url={content.thumbnailUrl} title={content.title} className="w-full h-full scale-100 brightness-75 transition-all duration-300" />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute inset-0 p-4 sm:p-6 md:p-10 flex flex-col justify-end">
          <div className="space-y-3 md:space-y-6 max-w-3xl">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {isCurrentlyLive && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-signal-red border border-white/10 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Now</span>
                </div>
              )}
              {content.category && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{content.category}</span>
                </div>
              )}
              {isStreamVod && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Stream Recording</span>
                </div>
              )}
            </div>

            {/* Content Title & Meta */}
            <div className="space-y-2">
              <h3 className="text-white font-bold text-2xl md:text-3xl lg:text-5xl leading-[1.05] tracking-tight line-clamp-2 drop-shadow-2xl">{content.title}</h3>
              {viewsLabel}
            </div>
          </div>
        </div>

        {/* Interaction Glow */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all duration-500 pointer-events-none" />
      </Link>
    </div>
  );
}
