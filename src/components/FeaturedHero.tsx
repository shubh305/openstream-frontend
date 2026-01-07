"use client";

import Link from "next/link";
import Image from "next/image";
import type { Stream, Video } from "@/types/api";
import { LiveVideoPlayer } from "@/components/LiveVideoPlayer";

const PLACEHOLDER_THUMBNAIL = "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80";

interface FeaturedHeroProps {
  content: Stream | Video;
}

export function FeaturedHero({ content }: FeaturedHeroProps) {
  const isLiveStream = "status" in content && content.status === "live";
  const stream = isLiveStream ? (content as Stream) : null;
  
  // Only show video player if it's a real HLS stream (ends with .m3u8)
  const hasRealHlsUrl = stream?.hlsPlaybackUrl?.endsWith('.m3u8') ?? false;

  // Backend may return streamer or creator - handle both
  const streamerInfo = stream?.streamer || stream?.creator;

  const href = isLiveStream
    ? `/live/${streamerInfo?.username || stream?.id || 'unknown'}`
    : `/watch/${content.id}`;

  const creatorName = isLiveStream
    ? (streamerInfo?.username || 'Unknown')
    : ((content as Video).creator?.username || 'Unknown');

  // If it's a live stream with a REAL HLS URL, show the video player
  if (isLiveStream && hasRealHlsUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-noir-border bg-noir-terminal group">
        <LiveVideoPlayer
          hlsUrl={stream!.hlsPlaybackUrl!}
          poster={stream!.thumbnailUrl || PLACEHOLDER_THUMBNAIL}
          autoplay={true}
        />
        {/* Creator info overlay */}
        <Link
          href={href}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20 hover:from-black/95 transition-colors"
        >
          <div className="flex items-center gap-3">
            {streamerInfo?.avatarUrl && (
              <Image
                src={streamerInfo.avatarUrl}
                alt={creatorName}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <h3 className="text-white font-bold text-lg line-clamp-1">
                {stream?.title}
              </h3>
              <p className="text-muted-text text-sm">{creatorName}</p>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Fallback to static thumbnail for VODs or streams without playback URL
  return (
    <div className="relative rounded-2xl overflow-hidden border border-noir-border bg-noir-terminal group">
      <Link href={href}>
        <div className="aspect-video relative">
          <Image
            src={content.thumbnailUrl || PLACEHOLDER_THUMBNAIL}
            alt={content.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Live Badge */}
          {isLiveStream && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-signal-red px-3 py-1.5 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-bold text-white uppercase">
                Live Now
              </span>
            </div>
          )}

          {/* Video Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg line-clamp-2">
              {content.title}
            </h3>
            <p className="text-muted-text text-sm mt-1">{creatorName}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
