"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Languages, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { SubtitleTrack } from "@/actions/video";

interface SubtitleSelectorProps {
  tracks: SubtitleTrack[];
  status: string;
  activeTrack: string | null;
  onTrackSelect: (lang: string | null) => void;
  className?: string;
}

/**
 * SubtitleSelector — Dropdown for selecting subtitle language.
 */
export function SubtitleSelector({ tracks, status, activeTrack, onTrackSelect, className }: SubtitleSelectorProps) {

  const isProcessing = ["processing", "transcribed", "translating"].includes(status);
  const hasSubtitles = tracks.length > 0;

  const handleToggle = useCallback(
    (lang: string) => {
      if (activeTrack === lang) {
        onTrackSelect(null);
      } else {
        onTrackSelect(lang);
      }
    },
    [activeTrack, onTrackSelect],
  );

  if (!hasSubtitles && !isProcessing) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-white hover:bg-white/10 h-10 w-10 relative cursor-pointer",
            activeTrack && "text-electric-lime",
            className,
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Languages className="h-5 w-5" />
          )}
          {activeTrack && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-electric-lime" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-noir-terminal border-white/10 text-white min-w-[160px]"
      >
        <DropdownMenuLabel className="text-[10px] text-muted-text flex items-center gap-1.5">
          <Languages className="h-3 w-3" />
          Subtitles
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />

        {/* Off option */}
        <DropdownMenuItem
          className={cn(
            "flex items-center justify-between gap-4 focus:bg-white/10 focus:text-white cursor-pointer",
            !activeTrack && "text-electric-lime",
          )}
          onClick={() => onTrackSelect(null)}
        >
          <span className="text-xs font-bold">Off</span>
          {!activeTrack && <Check className="h-3 w-3" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/5" />

        {/* Language options */}
        {tracks.map((track) => {
          const isActive = activeTrack === track.lang;
          return (
            <DropdownMenuItem
              key={track.lang}
              className={cn(
                "flex items-center justify-between gap-4 focus:bg-white/10 focus:text-white cursor-pointer",
                isActive && "text-electric-lime",
              )}
              onClick={() => handleToggle(track.lang)}
            >
              <span className="text-xs font-bold">{track.label}</span>
              {isActive && <Check className="h-3 w-3" />}
            </DropdownMenuItem>
          );
        })}

        {/* Processing status */}
        {isProcessing && (
          <>
            <DropdownMenuSeparator className="bg-white/5" />
            <div className="px-2 py-1.5 flex items-center gap-2 text-[10px] text-white/40">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Generating subtitles...</span>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
