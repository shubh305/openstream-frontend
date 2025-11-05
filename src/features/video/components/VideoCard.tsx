import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Link href={isLive ? `/live/${creator.username}` : `/watch/${id}`}>
      <Card className="group overflow-hidden border-none shadow-none bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
        {/* Thumbnail Section */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {isLive ? (
            <Badge variant="destructive" className="absolute bottom-2 right-2 rounded-sm px-1.5 py-0.5 text-xs">
              LIVE
            </Badge>
          ) : (
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
              {duration}
            </div>
          )}
        </div>

        {/* Metadata Section */}
        <div className="flex gap-3 pt-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={creator.avatarUrl} alt={creator.username} />
            <AvatarFallback>{creator.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col gap-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-neutral-900 dark:text-neutral-50 group-hover:text-black dark:group-hover:text-white">
              {title}
            </h3>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              <p className="hover:text-neutral-700 dark:hover:text-neutral-300">
                {creator.username}
              </p>
              <div className="flex items-center gap-1">
                <span>{Intl.NumberFormat('en-US', { notation: "compact" }).format(views)} views</span>
                <span>•</span>
                <span>{uploadedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
