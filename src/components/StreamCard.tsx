"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Stream } from "@/types/api";

const PLACEHOLDER_THUMBNAIL = "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80";

interface StreamCardProps {
  stream: Stream;
}

export function StreamCard({ stream }: StreamCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReturnType<typeof import("video.js").default> | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Only show video if it's a real HLS stream
  const hasRealHlsUrl = stream.hlsPlaybackUrl?.endsWith('.m3u8') ?? false;

  const initPlayer = useCallback(async () => {
    if (!videoRef.current || !hasRealHlsUrl) return;

    try {
      const videojs = (await import("video.js")).default;

      if (playerRef.current) return;

      const player = videojs(videoRef.current, {
        autoplay: true,
        controls: false,
        muted: true,
        loop: true,
        preload: "auto",
        html5: {
          vhs: {
            overrideNative: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
      });

      playerRef.current = player;

      player.src({
        src: stream.hlsPlaybackUrl!,
        type: "application/x-mpegURL",
      });

      player.on("playing", () => {
        setIsVideoReady(true);
      });

      player.on("error", () => {
        setIsVideoReady(false);
      });
    } catch (e) {
      console.error("Failed to initialize video player:", e);
    }
  }, [hasRealHlsUrl, stream.hlsPlaybackUrl]);

  const destroyPlayer = useCallback(() => {
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
    setIsVideoReady(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    hoverTimeoutRef.current = setTimeout(() => {
      initPlayer();
    }, 300);
  }, [initPlayer]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    destroyPlayer();
  }, [destroyPlayer]);

  const viewerCount = Intl.NumberFormat("en-US", { notation: "compact" }).format(stream.viewerCount || 0);
  
  const streamerInfo = stream.streamer || stream.creator;

  return (
    <Link 
      href={`/live/${streamerInfo?.username || stream.id}`}
      className="block group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail / Video Container */}
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-noir-terminal">
        {/* Static Thumbnail */}
        <Image
          src={stream.thumbnailUrl || PLACEHOLDER_THUMBNAIL}
          alt={stream.title}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isHovering && isVideoReady ? "opacity-0" : "opacity-100"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Video Player (only renders when has HLS URL) */}
        {hasRealHlsUrl && isHovering && (
          <div className={`stream-card-player absolute inset-0 transition-opacity duration-300 ${
            isVideoReady ? "opacity-100" : "opacity-0"
          }`}>
            <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
            <video
              ref={videoRef}
              className="video-js vjs-fluid"
              playsInline
              muted
            />
          </div>
        )}

        {/* LIVE Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-signal-red px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wide">Live</span>
        </div>

        {/* Viewer Count */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span>{viewerCount} viewers</span>
        </div>

        {/* Hover Overlay Effect */}
        <div className={`absolute inset-0 ring-2 ring-electric-lime rounded-lg transition-opacity duration-200 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`} />
      </div>

      {/* Stream Info */}
      <div className="flex gap-3 mt-2">
        {/* Streamer Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-noir-border shrink-0">
          {streamerInfo?.avatarUrl ? (
            <Image
              src={streamerInfo.avatarUrl}
              alt={streamerInfo.username || "Streamer"}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
              {(streamerInfo?.username || "U")[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Title & Meta */}
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-semibold text-white leading-tight line-clamp-1 group-hover:text-electric-lime transition-colors">
            {stream.title}
          </h3>
          <p className="text-xs text-muted-text mt-0.5 line-clamp-1">
            {streamerInfo?.username || "Unknown"}
          </p>
          <p className="text-xs text-muted-text line-clamp-1">
            {stream.category || "Just Chatting"}
          </p>
        </div>
      </div>

      {/* Video.js styles override*/}
      <style jsx global>{`
        .stream-card-player .vjs-fluid {
          padding-top: 0 !important;
          height: 100% !important;
        }
        .stream-card-player .vjs-fluid video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </Link>
  );
}
