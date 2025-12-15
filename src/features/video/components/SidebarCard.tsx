import Link from "next/link";
import Image from "next/image";

interface SidebarCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  creator: {
    username: string;
  };
  uploadedAt?: string;
  isLive?: boolean;
}

export function SidebarCard({
  id,
  title,
  thumbnailUrl,
  duration,
  views,
  creator,
  uploadedAt,
  isLive = false,
}: SidebarCardProps) {
  const formattedViews = Intl.NumberFormat("en-US", { notation: "compact" }).format(views);

  return (
    <Link 
      href={isLive ? `/live/${creator.username}` : `/watch/${id}`}
      className="group flex gap-3 hover:bg-noir-terminal/50 rounded-lg p-1 -m-1 transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative w-40 min-w-[10rem] aspect-video rounded-lg overflow-hidden bg-noir-terminal">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="160px"
        />
        {isLive && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-signal-red px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase">Live</span>
          </div>
        )}
        {!isLive && (
          <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
            {duration}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col justify-center gap-1 flex-1 min-w-0 py-1">
        <h4 className="text-sm font-medium text-white leading-tight line-clamp-2 group-hover:text-electric-lime transition-colors">
          {title}
        </h4>
        <span className="text-xs text-muted-text">
          {creator.username}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-text">
          <span>{formattedViews} views</span>
          <span>•</span>
          <span>{uploadedAt}</span>
        </div>
        {isLive && <span className="text-electric-lime text-xs font-bold mt-1">View now</span>}
      </div>
    </Link>
  );
}

