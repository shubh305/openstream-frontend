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
}

/**
 * VideoGrid Component
 * 
 * Displays a responsive grid of VideoCards.
 * Adapts to different screen sizes (1 col mobile -> 4 cols desktop).
 */
export function VideoGrid({ title, videos }: VideoGridProps) {
  return (
    <section className="py-8">
      {title && (
        <h2 className="mb-4 text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {videos.map((video) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
    </section>
  );
}
