import Link from "next/link";
import { VideoPlayer } from "@/features/video/components/VideoPlayer";
import { CommentSection } from "@/features/video/components/CommentSection";
import { SidebarCard } from "@/features/video/components/SidebarCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoInteractions } from "@/features/video/components/VideoInteractions";
import { getVideo, getRelatedVideos } from "@/actions/video";
import { getComments } from "@/actions/comment";
import { getSession } from "@/actions/auth";
import { notFound } from "next/navigation";
import { SubscribeButton } from "@/features/video/components/SubscribeButton";
import { getChannelByHandle } from "@/actions/channel";
import { getSubscriptions } from "@/actions/subscription";

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [video, recommendations, comments, session] = await Promise.all([getVideo(id), getRelatedVideos(id), getComments(id), getSession()]);

  if (!video) {
    notFound();
  }

  let channelId = "";
  let isOwner = false;
  let initialIsSubscribed = video.userInteraction?.subscribed || false;
  try {
    const channel = await getChannelByHandle(video.creator.username);
    if (channel) {
      channelId = channel.id;
      isOwner = session?.user?.id === channel.userId;

      if (channel.isSubscribed) {
        initialIsSubscribed = true;
      } else if (session && !initialIsSubscribed) {
        const subs = await getSubscriptions();
        if (subs.some(s => s.channelId === channel.id)) {
          initialIsSubscribed = true;
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch channel for video", e);
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-[1600px] p-0 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
          {/* Main Content */}
          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative sm:rounded-2xl overflow-hidden bg-noir-terminal aspect-video">
              <VideoPlayer videoId={video.id} posterUrl={video.posterUrl} videoUrl={video.videoUrl} resolutions={video.resolutions} />
            </div>

            {/* Title Row */}
            <div className="px-4 sm:px-0 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-lg md:text-xl font-bold text-white leading-tight">{video.title}</h1>
                <div className="flex items-center gap-1.5 shrink-0">
                  <VideoInteractions videoId={video.id} initialLikes={video.likes || 0} initialUserInteraction={video.userInteraction} />
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center justify-between gap-4 bg-noir-terminal/30 p-3 rounded-xl sm:bg-transparent sm:p-0">
                <Link href={`/@${video.creator.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
                  <Avatar className="h-9 w-9 md:h-10 md:w-10">
                    <AvatarImage src={video.creator.avatarUrl} alt={video.creator.username} />
                    <AvatarFallback className="bg-electric-lime text-black font-bold">{video.creator.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm md:text-base truncate">{video.creator.username}</span>
                      {video.creator.isVerified && <span className="text-[10px] bg-electric-lime text-black px-1 py-0.5 rounded font-bold">✓</span>}
                    </div>
                    <span className="text-[10px] md:text-xs text-muted-text">{video.creator.subscribers || 0} subs</span>
                  </div>
                </Link>
                {channelId && !isOwner && <SubscribeButton channelId={channelId} channelName={video.creator.username} initialIsSubscribed={initialIsSubscribed} />}
              </div>
            </div>

            {/* Description */}
            <div className="mx-4 sm:mx-0 bg-noir-terminal/50 rounded-xl p-4">
              <div className="text-xs md:text-sm text-muted-text mb-2">
                {Intl.NumberFormat("en-US", { notation: "compact" }).format(video.views)} views • {video.uploadedAt}
              </div>
              <p className="text-xs md:text-sm text-white/80 whitespace-pre-wrap line-clamp-3">{video.description}</p>
            </div>

            {/* Comments */}
            {video.visibility !== "private" && (
              <div className="px-4 sm:px-0">
                <CommentSection videoId={video.id} initialComments={comments} currentUser={session?.user} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="px-4 sm:px-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">You may like</h3>
              <Link href="/videos" className="text-xs text-electric-lime hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {recommendations.slice(0, 10).map(rec => (
                <SidebarCard key={rec.id} id={rec.id} title={rec.title} thumbnailUrl={rec.thumbnailUrl} duration={rec.duration} views={rec.views} uploadedAt={rec.uploadedAt} creator={rec.creator} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
