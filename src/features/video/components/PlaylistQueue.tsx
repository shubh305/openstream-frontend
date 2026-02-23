"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Shuffle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Playlist } from "@/actions/playlist";
import { Video } from "@/types/api";

interface PlaylistQueueProps {
  playlist: Playlist;
  currentVideoId: string;
  isShuffle: boolean;
  onShuffleToggle: () => void;
  displayVideos: Video[];
}

export function PlaylistQueue({ playlist, currentVideoId, isShuffle, onShuffleToggle, displayVideos }: PlaylistQueueProps) {
  const [isOpen, setIsOpen] = useState(true);

  const currentIndex = displayVideos.findIndex(v => v.id === currentVideoId);

  return (
    <div className="bg-noir-terminal/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{playlist.title}</h3>
            <p className="text-[10px] text-muted-text uppercase tracking-widest font-black mt-1">
              {playlist.owner?.username || "Playlist"} • {currentIndex + 1} / {displayVideos.length}
            </p>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="text-muted-text hover:text-white transition-colors p-1">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={onShuffleToggle}
             className={cn(
               "p-2 rounded-lg transition-all",
               isShuffle ? "bg-electric-lime text-black" : "bg-white/5 text-muted-text hover:text-white"
             )}
           >
             <Shuffle className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Playlist List */}
      <div className={cn(
        "flex-1 overflow-y-auto custom-scrollbar transition-all duration-300",
        !isOpen && "h-0 opacity-0 pointer-events-none"
      )}>
        {displayVideos.map((video, index) => {
          const isActive = video.id === currentVideoId;
          return (
            <Link
              key={video.id}
              href={`/watch/${video.id}?list=${playlist.id}${isShuffle ? '&shuffle=1' : ''}`}
              className={cn(
                "flex gap-3 p-3 transition-colors relative group cursor-pointer",
                isActive ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="flex items-center justify-center w-4 shrink-0">
                {isActive ? (
                  <Play className="w-3 h-3 text-electric-lime fill-electric-lime" />
                ) : (
                  <span className="text-[10px] font-mono text-muted-text group-hover:hidden">{index + 1}</span>
                )}
                {!isActive && <Play className="w-3 h-3 text-white hidden group-hover:block" />}
              </div>

              <div className="relative w-24 aspect-video bg-black rounded overflow-hidden shrink-0 border border-white/5">
                {video.thumbnailUrl ? (
                  <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" sizes="100px" />
                ) : (
                   <div className="w-full h-full bg-noir-terminal flex items-center justify-center">
                     <Play className="w-8 h-8 text-white/10" />
                   </div>
                )}
                <div className="absolute bottom-0.5 right-0.5 bg-black/80 px-1 py-0.5 text-[8px] text-white font-medium rounded">
                  {video.duration || "00:00"}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "text-[11px] font-bold truncate leading-tight",
                  isActive ? "text-electric-lime" : "text-white"
                )}>
                  {video.title}
                </h4>
                <p className="text-[10px] text-muted-text mt-1 truncate">
                  {video.creator?.username || "Unknown"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
