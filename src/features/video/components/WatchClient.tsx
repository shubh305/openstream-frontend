"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoPlayer } from "./VideoPlayer";
import { CommentSection } from "./CommentSection";
import { SidebarCard } from "./SidebarCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoInteractions } from "./VideoInteractions";
import { PlaylistAction } from "@/components/PlaylistAction";
import { SubscribeButton } from "./SubscribeButton";
import { ClipsRail } from "./ClipsRail";
import { PlaylistQueue } from "./PlaylistQueue";
import { Video, Comment, Session, Clip } from "@/types/api";
import { Playlist } from "@/actions/playlist";

interface WatchClientProps {
  video: Video;
  recommendations: Video[];
  comments: Comment[];
  session: Session | null;
  clips: Clip[];
  playlist?: Playlist | null;
  isShuffle?: boolean;
  channelId: string;
  isOwner: boolean;
  initialIsSubscribed: boolean;
}

export function WatchClient({
  video,
  recommendations,
  comments,
  session,
  clips,
  playlist,
  isShuffle: initialShuffle = false,
  channelId,
  isOwner,
  initialIsSubscribed,
}: WatchClientProps) {
  const router = useRouter();
  const [isShuffle, setIsShuffle] = useState(initialShuffle);
  const [displayVideos, setDisplayVideos] = useState<Video[]>(playlist?.videos || []);

  useEffect(() => {
    if (isShuffle && playlist?.videos) {
      const shuffled = [...playlist.videos].sort(() => Math.random() - 0.5);
      setDisplayVideos(shuffled);
    } else {
      setDisplayVideos(playlist?.videos || []);
    }
  }, [isShuffle, playlist?.videos]);

  const handleVideoEnded = () => {
    if (!playlist || !displayVideos.length) return;
    
    const activeIndex = displayVideos.findIndex((v: Video) => v.id === video.id);
    const nextIndex = activeIndex + 1;
    
    if (nextIndex < displayVideos.length) {
      const nextVideo = displayVideos[nextIndex];
      router.push(`/watch/${nextVideo.id}?list=${playlist.id}&index=${nextIndex}${isShuffle ? "&shuffle=1" : ""}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-[1600px] p-0 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
          {/* Main Content */}
          <div className="space-y-4 min-w-0">
            {/* Video Player */}
            <div className="relative sm:rounded-2xl overflow-hidden bg-noir-terminal aspect-video max-h-[75vh]">
              <VideoPlayer 
                videoId={video.id} 
                posterUrl={video.posterUrl} 
                videoUrl={video.videoUrl} 
                resolutions={video.resolutions} 
                status={video.status} 
                onEnded={handleVideoEnded}
              />
            </div>

            {/* Title Row */}
            <div className="px-4 sm:px-0 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-lg md:text-xl font-bold text-white leading-tight">{video.title}</h1>
                <div className="flex items-center gap-1.5 shrink-0">
                  <VideoInteractions videoId={video.id} initialLikes={video.likes || 0} initialUserInteraction={video.userInteraction} />
                  <PlaylistAction videoId={video.id} />
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

            {/* Description & AI Insights */}
            <div className="mx-4 sm:mx-0 bg-noir-terminal/50 rounded-xl overflow-hidden">
              <div className="p-4">
                <div className="text-xs md:text-sm text-muted-text mb-2">
                  {Intl.NumberFormat("en-US", { notation: "compact" }).format(video.views)} views • {video.uploadedAt}
                </div>
                <p className="text-xs md:text-sm text-white/80 whitespace-pre-wrap line-clamp-3">{video.description}</p>
              </div>

              {video.aiMetadata && (
                <div className="border-t border-noir-border/30 bg-electric-lime/5 p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-electric-lime animate-pulse" />
                    <h3 className="text-[10px] uppercase tracking-wider font-mono text-electric-lime font-bold">AI Insight</h3>
                  </div>

                  {video.aiMetadata.summary && (
                    <div className="space-y-1">
                      <p className="text-xs text-white/90 leading-relaxed italic">&ldquo;{video.aiMetadata.summary}&rdquo;</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">
                    {video.aiMetadata.entities && video.aiMetadata.entities.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-muted-text font-mono">Mentions</span>
                        <div className="flex flex-wrap gap-1.5">
                          {video.aiMetadata.entities.map((en, i) => (
                            <span key={i} className="text-[10px] text-white/70 bg-noir-bg px-2 py-0.5 rounded border border-noir-border/50">
                              {en}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {video.aiMetadata.topic && (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-muted-text font-mono">Topic</span>
                        <div>
                          <span className="text-[10px] text-electric-lime bg-electric-lime/10 px-2 py-0.5 rounded border border-electric-lime/30">{video.aiMetadata.topic}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {video.aiMetadata.keyMoments && video.aiMetadata.keyMoments.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase text-muted-text font-mono">Key Moments</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {video.aiMetadata.keyMoments.map((km, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 rounded bg-black/40 border border-noir-border/20 hover:border-electric-lime/30 transition-colors group cursor-pointer">
                            <span className="text-[10px] font-mono text-electric-lime shrink-0 bg-electric-lime/10 px-1.5 py-0.5 rounded">
                              {Math.floor(km.time / 60)}:{(km.time % 60).toString().padStart(2, "0")}
                            </span>
                            <span className="text-[11px] text-white/80 group-hover:text-white transition-colors line-clamp-1">{km.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Clips Rail */}
            <ClipsRail videoId={video.id} clips={clips} />

            {/* Comments */}
            {video.visibility !== "private" && (
              <div className="px-4 sm:px-0">
                <CommentSection videoId={video.id} initialComments={comments} currentUser={session?.user} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="px-4 sm:px-0 space-y-6 min-w-0">
            {/* Playlist Queue */}
            {playlist && (
              <PlaylistQueue 
                playlist={playlist} 
                currentVideoId={video.id} 
                isShuffle={isShuffle}
                onShuffleToggle={() => setIsShuffle(!isShuffle)}
                displayVideos={displayVideos}
              />
            )}

            <div className="space-y-4">
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
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
