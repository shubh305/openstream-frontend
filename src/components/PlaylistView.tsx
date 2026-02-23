"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Play, Shuffle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaylistSettings } from "@/components/PlaylistSettings";
import { PlaylistAction } from "@/components/PlaylistAction";
import { removeFromPlaylist, removeFromWatchLater, Playlist } from "@/actions/playlist";
import { Video } from "@/types/api";

interface PlaylistViewProps {
  initialPlaylist: Playlist;
  isWatchLater: boolean;
}

export function PlaylistView({ initialPlaylist, isWatchLater }: PlaylistViewProps) {
  const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const router = useRouter();

  const handleRemove = async (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setRemovingId(videoId);
    const res = isWatchLater
      ? await removeFromWatchLater(videoId)
      : await removeFromPlaylist(playlist.id, videoId);

    if (res.success) {
      toast.success("Removed from playlist");
      setPlaylist((prev: Playlist) => ({
        ...prev,
        videos: prev.videos?.filter((v: Video) => v.id !== videoId) || [],
        videoCount: prev.videoCount - 1,
      }));
      router.refresh();
    } else {
      toast.error(res.error);
    }
    setRemovingId(null);
  };


  const videos = playlist.videos || [];
  const displayThumbnail = playlist.thumbnailUrl || (videos.length > 0 ? videos[0].thumbnailUrl : null);

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Playlist Sidebar Info */}
      <div className="w-full lg:w-96 p-6 shrink-0 lg:fixed lg:h-[calc(100vh-4rem)] lg:overflow-y-auto bg-gradient-to-b from-noir-terminal to-background border-r border-noir-border z-10">
        <div className="aspect-video w-full bg-noir-bg rounded-xl mb-6 relative group overflow-hidden border border-noir-border shadow-2xl">
          {displayThumbnail ? (
            <Image src={displayThumbnail} alt={playlist.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-noir-terminal">
              <Play className="w-12 h-12 text-muted-text/30" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-white line-clamp-2">{playlist.title}</h1>
          {!isWatchLater && <PlaylistSettings playlistId={playlist.id} playlistTitle={playlist.title} playlistDescription={playlist.description} />}
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-sm font-medium text-electric-lime">{playlist.description || "Playlist"}</div>
          <div className="text-[10px] text-muted-text uppercase tracking-widest flex items-center gap-2 font-black">
            <span>{playlist.videoCount} videos</span>
            <span>•</span>
            <span className="text-white/60">{playlist.updatedAt}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest"
            onClick={() => {
              if (videos.length > 0) {
                router.push(`/watch/${videos[0].id}?list=${playlist.id}`);
              } else {
                toast.error("No videos in playlist");
              }
            }}
          >
            <Play className="w-4 h-4 mr-2" /> Play All
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-noir-border hover:bg-noir-bg text-muted-text hover:text-foreground font-bold uppercase tracking-widest"
            onClick={() => {
              if (videos.length > 0) {
                const randomIndex = Math.floor(Math.random() * videos.length);
                router.push(`/watch/${videos[randomIndex].id}?list=${playlist.id}&shuffle=1`);
              } else {
                toast.error("No videos in playlist");
              }
            }}
          >
            <Shuffle className="w-4 h-4 mr-2" /> Shuffle
          </Button>
        </div>
      </div>

      {/* Playlist Items */}
      <div className="flex-1 lg:ml-96 p-6">
        <div className="space-y-2">
          {videos.length === 0 ? (
            <div className="text-muted-text text-center py-10">No videos in this playlist yet.</div>
          ) : (
            videos.map((video: Video, index: number) => (
                <div
                  key={video.id}
                  className="group flex gap-4 p-2 rounded-lg hover:bg-noir-terminal border border-transparent hover:border-noir-border transition-all relative cursor-pointer"
                >
                  <Link
                    href={`/watch/${video.id}?list=${playlist.id}&index=${index}`}
                    className="flex-1 flex gap-4 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8 text-muted-text text-sm font-mono md:group-hover:hidden">{index + 1}</div>
                    <div className="hidden md:group-hover:flex items-center justify-center w-8 text-muted-text">
                      <Play className="w-4 h-4 text-white" />
                    </div>

                    <div className="relative w-40 aspect-video bg-noir-bg rounded overflow-hidden shrink-0 border border-noir-border">
                      {video.thumbnailUrl && video.thumbnailUrl !== "/placeholder.jpg" ? (
                        <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" sizes="160px" />
                      ) : (
                        <div className="w-full h-full bg-noir-terminal flex items-center justify-center border border-white/5 group-hover:bg-white/5 transition-colors">
                          <Play className="w-8 h-8 text-white/20 group-hover:text-electric-lime transition-colors" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-[10px] text-white font-medium rounded z-10">
                        {video.duration || "00:00"}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-white truncate">{video.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-text mt-1">
                        <span>{video.creator?.username || (video as unknown as Record<string, string>).channelName || "Unknown"}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity z-20" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-text hover:text-signal-red"
                      onClick={(e) => handleRemove(video.id, e)}
                      disabled={removingId === video.id}
                    >
                      {removingId === video.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    </Button>
                    <PlaylistAction videoId={video.id} />
                  </div>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
