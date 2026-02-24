"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StreamThumbnail } from "@/components/StreamThumbnail";
import { cn } from "@/lib/utils";
import { PlaylistAction } from "@/components/PlaylistAction";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  uploadedAt: string;
  creator: {
    username: string;
    avatarUrl?: string;
  };
  isLive?: boolean;
  status?: string;
  resolutions?: string[];
}

export function VideoCard({ id, title, thumbnailUrl, duration, views, uploadedAt, creator, isLive = false, status, resolutions = [] }: VideoCardProps) {
  const isReady = isLive || resolutions.length > 0 || status === "READY" || status === "PUBLISHED";

  return (
    <div className={cn("group relative flex flex-col gap-4 pointer-events-auto shrink-0 transition-opacity", !isReady && "opacity-70")}>
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        {/* Thumbnail Section */}
        <Link
          href={`/watch/${id}`}
          className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-noir-terminal cursor-pointer"
          onClick={() => trackEvent(AnalyticsEvent.VIDEO_CLICK, { video_id: id, source: "home" })}
        >
          <StreamThumbnail url={thumbnailUrl} title={title} className="w-full h-full scale-100" avatarUrl={creator?.avatarUrl} avatarFallback={(creator?.username || title || "V")[0].toUpperCase()} />

          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 pointer-events-none">
              <div className="flex flex-col items-center gap-3">
                <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-1/3" />
                </div>
                <span className="text-[10px] font-black text-white/80 tracking-[0.2em] uppercase">Processing...</span>
              </div>
            </div>
          )}

          {isLive ? (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-md z-20">
              <div className="w-1.5 h-1.5 rounded-full bg-signal-red" />
              <span className="text-[9px] font-black text-white uppercase tracking-[0.1em]">Stream</span>
            </div>
          ) : (
            isReady && <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded-md z-20 font-bold text-[9px] text-white tracking-[0.15em] uppercase">{duration}</div>
          )}
        </Link>

        {/* Metadata Section */}
        <div className="flex gap-4 px-1 mt-1">
          <Link href={`/watch/${id}`} className="shrink-0 cursor-pointer">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={creator?.avatarUrl} alt={creator?.username || "Unknown"} />
              <AvatarFallback className="bg-noir-deep text-white text-xs font-bold uppercase">{(creator?.username || "U")[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/watch/${id}`} className="flex-1 min-w-0 cursor-pointer">
                <h3 className="text-base md:text-sm font-bold text-white leading-snug md:leading-tight line-clamp-2 transition-colors group-hover:text-white/90">{title}</h3>
              </Link>
              <PlaylistAction videoId={id} className="relative z-30 shrink-0" />
            </div>
            <Link href={`/watch/${id}`} className="flex flex-col mt-2 md:mt-1.5 cursor-pointer">
              <p className="text-sm md:text-[11px] text-muted-text font-bold md:font-medium group-hover:text-white/70 transition-colors truncate">{creator?.username || "Unknown Creator"}</p>
              <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-text/60 mt-1 font-medium">
                <span>{Intl.NumberFormat("en-US", { notation: "compact" }).format(views)} views</span>
                <span className="w-0.5 h-0.5 rounded-full bg-muted-text/40" />
                <span>{uploadedAt}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
