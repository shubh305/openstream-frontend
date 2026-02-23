"use client";

import { useState } from "react";
import { MoreVertical, Clock, ListPlus, Loader2, Check, Share2, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addToWatchLater, getUserPlaylists, addToPlaylist, Playlist } from "@/actions/playlist";
import { toast } from "sonner";

interface PlaylistActionProps {
  videoId: string;
  className?: string;
}

export function PlaylistAction({ videoId, className }: PlaylistActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setIsLoading(true);
      try {
        const data = await getUserPlaylists(videoId);
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to load playlists", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onAddToWatchLater = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAlreadyInWatchLater) return;

    const res = await addToWatchLater(videoId);
    if (res.success) {
      toast.success("Added to Watch Later");
      setPlaylists(prev => {
        const hasWatchLater = prev.some(p => p.title.toLowerCase() === "watch later");
        if (hasWatchLater) {
          return prev.map(p => 
            p.title.toLowerCase() === "watch later" ? { ...p, includesVideo: true } : p
          );
        } else {
          return [...prev, { id: "watch-later", title: "Watch Later", includesVideo: true, videoCount: 1 } as Playlist];
        }
      });
    } else {
      toast.error(res.error);
    }
    setIsOpen(false);
  };

  const onAddToPlaylist = async (playlistId: string, playlistTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(playlistId);
    const res = await addToPlaylist(playlistId, videoId);
    if (res.success) {
      toast.success(`Added to ${playlistTitle}`);
      setPlaylists(prev => prev.map(p => 
        p.id === playlistId ? { ...p, includesVideo: true } : p
      ));
    } else {
      toast.error(res.error);
    }
    setIsAdding(null);
    setIsOpen(false);
  };

  const onShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/watch/${videoId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
    setIsOpen(false);
  };

  const watchLaterPlaylist = playlists.find(p => p.title.toLowerCase() === "watch later");
  const isAlreadyInWatchLater = watchLaterPlaylist?.includesVideo;

  return (
    <div className={cn("relative z-30", className)} onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-noir-terminal text-white hover:bg-white hover:text-black transition-all focus-visible:ring-0 cursor-pointer border-none"
          >
            <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-noir-terminal border-white/5 text-white p-1">
          <DropdownMenuItem
            disabled={isLoading || !!isAlreadyInWatchLater}
            className={cn(
              "flex items-center gap-3 py-2.5 px-3 focus:bg-white/5 rounded-lg",
              (isLoading || isAlreadyInWatchLater) ? "opacity-40 select-none" : "cursor-pointer"
            )}
            onClick={onAddToWatchLater}
          >
            {isAlreadyInWatchLater ? (
              <Check className="h-4 w-4 text-electric-lime" />
            ) : (
              <Clock className="h-4 w-4 text-electric-lime" />
            )}
            <span className={cn("text-xs font-bold uppercase tracking-widest", isAlreadyInWatchLater && "text-electric-lime")}>
              {isAlreadyInWatchLater ? "In Watch Later" : "Watch Later"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-3 py-2.5 px-3 focus:bg-white/5 cursor-pointer rounded-lg"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4 text-muted-text" />
            <span className="text-xs font-bold uppercase tracking-widest">Share</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-3 py-2.5 px-3 focus:bg-white/5 cursor-pointer rounded-lg text-signal-red focus:text-signal-red"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <Flag className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Report</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-white/5 mx-1" />
          
          <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-muted-text uppercase tracking-[0.2em]">
            Add to Playlist
          </DropdownMenuLabel>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-text" />
            </div>
          ) : playlists.length > 0 ? (
            playlists
              .filter(p => p.title.toLowerCase() !== "watch later")
              .map(playlist => (
              <DropdownMenuItem
                key={playlist.id}
                className={cn(
                  "flex items-center justify-between py-2.5 px-3 focus:bg-white/5 rounded-lg group",
                  playlist.includesVideo ? "pointer-events-none" : "cursor-pointer"
                )}
                onClick={(e) => {
                  if (!playlist.includesVideo) {
                    onAddToPlaylist(playlist.id, playlist.title, e);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {playlist.includesVideo ? (
                    <Check className="h-4 w-4 text-electric-lime" />
                  ) : (
                    <ListPlus className="h-4 w-4 text-muted-text group-hover:text-white transition-colors" />
                  )}
                  <span className={cn("text-xs font-bold leading-none", playlist.includesVideo && "text-electric-lime")}>{playlist.title}</span>
                </div>
                {isAdding === playlist.id && <Loader2 className="h-3 w-3 animate-spin" />}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">No playlists found</p>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
