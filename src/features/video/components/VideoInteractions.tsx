"use client";

import { useEffect, useState, useRef } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { incrementView, likeVideo, unlikeVideo, dislikeVideo } from "@/actions/video";

type VideoInteractionsProps = {
  videoId: string;
  initialLikes?: number;
  initialUserInteraction?: {
    liked: boolean;
    disliked: boolean;
    subscribed: boolean;
  };
};

export function VideoInteractions({ videoId, initialLikes = 0, initialUserInteraction }: VideoInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [userInteraction, setUserInteraction] = useState(
    initialUserInteraction || {
      liked: false,
      disliked: false,
      subscribed: false,
    }
  );
  const hasIncrementedView = useRef(false);

  useEffect(() => {
    if (!hasIncrementedView.current) {
      hasIncrementedView.current = true;
      incrementView(videoId).catch(err => console.error("Failed to increment view", err));
    }
  }, [videoId]);

  const handleLike = async () => {
    const previousInteraction = { ...userInteraction };
    const previousLikes = likes;

    if (userInteraction.liked) {
      setUserInteraction(prev => ({ ...prev, liked: false }));
      setLikes(l => Math.max(0, l - 1));
      
      const success = await unlikeVideo(videoId);
      if (!success) {
        setUserInteraction(previousInteraction);
        setLikes(previousLikes);
      }
    } else {
      setUserInteraction(prev => ({ ...prev, liked: true, disliked: false }));
      if (previousInteraction.disliked) {
      }
      setLikes(l => l + 1);
      
      const success = await likeVideo(videoId);
      if (!success) {
        // Revert
        setUserInteraction(previousInteraction);
        setLikes(previousLikes);
      }
    }
  };

  const handleDislike = async () => {
    const previousInteraction = { ...userInteraction };
    const previousLikes = likes;

    if (userInteraction.disliked) {
      setUserInteraction(prev => ({ ...prev, disliked: false }));
      
      const success = await unlikeVideo(videoId); 
      if (!success) {
        setUserInteraction(previousInteraction);
      }
    } else {
      setUserInteraction(prev => ({ ...prev, disliked: true, liked: false }));
      if (previousInteraction.liked) {
        setLikes(l => Math.max(0, l - 1));
      }
      
      const success = await dislikeVideo(videoId);
      if (!success) {
        setUserInteraction(previousInteraction);
        setLikes(previousLikes);
      }
    }
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer outline-none focus:ring-0 ${
          userInteraction.liked
            ? "bg-white text-black hover:bg-white/90"
            : "bg-noir-terminal hover:bg-noir-border text-white"
        }`}
      >
        <ThumbsUp className={`w-3.5 h-3.5 ${userInteraction.liked ? "fill-current" : ""}`} />
        {likes > 0 && (
          <span className="text-[10px] md:text-xs font-bold">
            {Intl.NumberFormat("en-US", { notation: "compact" }).format(likes)}
          </span>
        )}
      </button>
      
      <button
        onClick={handleDislike}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer outline-none focus:ring-0 ${
          userInteraction.disliked
            ? "bg-white text-black hover:bg-white/90"
            : "bg-noir-terminal hover:bg-noir-border text-white"
        }`}
      >
        <ThumbsDown className={`w-3.5 h-3.5 ${userInteraction.disliked ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
