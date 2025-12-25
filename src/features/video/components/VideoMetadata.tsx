import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, MoreHorizontal } from "lucide-react";
import { LikeButton } from "./LikeButton";
import { SubscribeButton } from "./SubscribeButton";

interface VideoMetadataProps {
  videoId: string;
  title: string;
  description: string;
  views: number;
  uploadedAt: string;
  likeCount?: number;
  isLiked?: boolean;
  isSubscribed?: boolean;
  creator: {
    id: string;
    username: string;
    avatarUrl?: string;
    subscribers: string;
  };
}

export function VideoMetadata({ videoId, title, description, views, uploadedAt, likeCount = 0, isLiked = false, isSubscribed = false, creator }: VideoMetadataProps) {
  return (
    <div className="space-y-4 py-4">
      <h1 className="text-xl font-bold md:text-2xl text-neutral-900 dark:text-white">{title}</h1>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Creator Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={creator.avatarUrl} alt={creator.username} />
            <AvatarFallback>{creator.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{creator.username}</h3>
            <p className="text-xs text-neutral-500">{creator.subscribers} subscribers</p>
          </div>
          <SubscribeButton channelId={creator.id} channelName={creator.username} initialIsSubscribed={isSubscribed} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <LikeButton videoId={videoId} initialLikeCount={likeCount} initialIsLiked={isLiked} />
            <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />
            {/* Dislike button placeholder */}
          </div>
          <Button variant="secondary" className="rounded-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Description Box */}
      <div className="rounded-xl bg-neutral-100 p-3 text-sm dark:bg-neutral-800">
        <div className="mb-2 font-medium text-neutral-900 dark:text-white">
          {Intl.NumberFormat("en-US", { notation: "compact" }).format(views)} views • {uploadedAt}
        </div>
        <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{description}</p>
      </div>
    </div>
  );
}
