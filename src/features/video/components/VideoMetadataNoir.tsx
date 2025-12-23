"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";

interface VideoMetadataNoirProps {
  id: string;
  title: string;
  description: string;
  views: number;
  uploadedAt: string;
  creator: {
    username: string;
    avatarUrl?: string;
    subscribers: string;
  };
}

export function VideoMetadataNoir({
  id,
  title,
  description,
  views,
  uploadedAt,
  creator,
}: VideoMetadataNoirProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const formattedViews = Intl.NumberFormat("en-US", { notation: "compact" }).format(views);

  return (
    <div className="mt-6 space-y-6">
      {/* Title */}
      <h1 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white leading-tight">
        {title}
      </h1>

      {/* Creator Row + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-noir-border">
        {/* Creator Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-noir-border grayscale">
            <AvatarImage src={creator.avatarUrl} alt={creator.username} />
            <AvatarFallback className="bg-noir-terminal text-electric-lime font-bold">
              {creator.username[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-electric-lime uppercase tracking-widest">
              {creator.username}
            </span>
            <span className="text-[10px] text-muted-text uppercase tracking-widest">
              {creator.subscribers} Subscribers
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4 border-electric-lime text-electric-lime hover:bg-electric-lime hover:text-black text-[10px] uppercase tracking-widest font-bold rounded-none"
          >
            Subscribe
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border border-noir-border">
            <Button variant="ghost" size="sm" className="rounded-none text-white hover:bg-noir-border px-3">
              <ThumbsUp className="h-4 w-4 mr-2" />
              <span className="text-[10px] uppercase tracking-widest">12K</span>
            </Button>
            <div className="w-px h-6 bg-noir-border" />
            <Button variant="ghost" size="sm" className="rounded-none text-white hover:bg-noir-border px-3">
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="border border-noir-border rounded-none text-white hover:bg-noir-border px-3">
            <Share2 className="h-4 w-4 mr-2" />
            <span className="text-[10px] uppercase tracking-widest">Share</span>
          </Button>
          <Button variant="ghost" size="sm" className="border border-noir-border rounded-none text-white hover:bg-noir-border px-3">
            <Download className="h-4 w-4 mr-2" />
            <span className="text-[10px] uppercase tracking-widest">Save</span>
          </Button>
          <Button variant="ghost" size="icon" className="border border-noir-border rounded-none text-white hover:bg-noir-border">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-text">
        <span>ID_{id.padStart(4, "0")}</span>
        <span className="text-noir-border">|</span>
        <span>VWS: <span className="text-white">{formattedViews}</span></span>
        <span className="text-noir-border">|</span>
        <span>UPLOADED: <span className="text-white">{uploadedAt.toUpperCase().replace(/ /g, "_")}</span></span>
      </div>

      {/* Description */}
      <div className="bg-noir-terminal/50 border border-noir-border p-4 space-y-3">
        <pre 
          className={`text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed ${
            !isDescriptionExpanded ? "line-clamp-3" : ""
          }`}
        >
          {description}
        </pre>
        <button 
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-electric-lime hover:underline"
        >
          {isDescriptionExpanded ? (
            <>Show_Less <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>Show_More <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      </div>
    </div>
  );
}
