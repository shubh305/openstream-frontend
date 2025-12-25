import Link from "next/link";
import { VideoCard } from "./VideoCard";

interface Video {
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
}

interface VideoGridProps {
  videos: Video[];
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
}

/**
 * VideoGrid Component
 *
 * Displays a responsive grid of VideoCards.
 * Adapts to different screen sizes (1 col mobile -> 4 cols desktop).
 */
export function VideoGrid({ title, videos, showViewAll = false, viewAllHref = "#" }: VideoGridProps) {
  if (videos.length === 0) return null;

  return (
    <section className="py-8">
      {title && (
        <div className="mb-8 flex items-center gap-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-white">{title}</h2>
          <div className="flex-1 h-[1px] bg-noir-border" />
          {showViewAll && (
            <Link href={viewAllHref} className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-text hover:text-electric-lime transition-colors flex items-center gap-2 group">
              View_All
              <span className="text-electric-lime group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}
          <div className="w-2 h-2 rounded-full border border-electric-lime" />
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map(video => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
    </section>
  );
}
