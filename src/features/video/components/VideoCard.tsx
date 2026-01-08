import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PLACEHOLDER_THUMBNAIL = "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80";

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
}

export function VideoCard({
  id,
  title,
  thumbnailUrl,
  duration,
  views,
  uploadedAt,
  creator,
  isLive = false,
}: VideoCardProps) {
  return (
    <Link href={isLive ? `/live/${creator?.username || id}` : `/watch/${id}`}>
      <div className="group relative rounded-xl overflow-hidden bg-noir-terminal/40 hover:bg-noir-terminal transition-all duration-300">
        {/* Thumbnail Section */}
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={thumbnailUrl || PLACEHOLDER_THUMBNAIL}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isLive ? (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-signal-red px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold text-white uppercase">Live</span>
            </div>
          ) : (
            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium text-white">{duration}</div>
          )}
        </div>

        {/* Metadata Section */}
        <div className="flex gap-3 p-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={creator?.avatarUrl} alt={creator?.username || "Unknown"} />
            <AvatarFallback className="bg-noir-border text-white text-xs font-bold">{(creator?.username || "U")[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-electric-lime transition-colors">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-text">
              <span>{creator?.username || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-text">
              <span>{Intl.NumberFormat("en-US", { notation: "compact" }).format(views)} views</span>
              <span>•</span>
              <span>{uploadedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

