import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StreamThumbnail } from "@/components/StreamThumbnail";

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

export function VideoCard({ id, title, thumbnailUrl, duration, views, uploadedAt, creator, isLive = false }: VideoCardProps) {
  return (
    <Link href={`/watch/${id}`}>
      <div className="group relative rounded-xl overflow-hidden bg-noir-terminal/40 hover:bg-noir-terminal transition-all duration-300">
        {/* Thumbnail Section */}
        <div className="relative aspect-video w-full overflow-hidden">
          <StreamThumbnail url={thumbnailUrl} title={title} className="w-full h-full" avatarUrl={creator?.avatarUrl} avatarFallback={(creator?.username || title || "V")[0].toUpperCase()} />
          {isLive ? (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-noir-border/80 border border-white/20 backdrop-blur-md px-2.5 py-1 rounded-md z-20">
              <span className="text-[10px] font-bold text-white tracking-widest">Stream</span>
            </div>
          ) : (
            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium text-white z-20">{duration}</div>
          )}
        </div>

        {/* Metadata Section */}
        <div className="flex gap-4 p-4">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={creator?.avatarUrl} alt={creator?.username || "Unknown"} />
            <AvatarFallback className="bg-noir-border text-white text-xs font-bold">{(creator?.username || "U")[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5 min-w-0">
            <h3 className="text-base font-semibold text-white leading-tight line-clamp-2 group-hover:text-electric-lime transition-colors">{title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-text">
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
