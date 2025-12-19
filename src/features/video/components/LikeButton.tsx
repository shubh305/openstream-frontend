"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ThumbsUp } from "lucide-react";

interface LikeButtonProps {
  videoId: string;
  initialLikeCount: number;
  initialIsLiked?: boolean;
}

// videoId is intentionally captured for future backend API integration
export function LikeButton({ videoId, initialLikeCount, initialIsLiked = false }: LikeButtonProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    setIsLoading(true);
    
    try {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

      // TODO: Replace with actual server action once backend supports it
      // const result = await likeVideo(videoId);
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulating backend not ready
      const backendReady = false;
      if (!backendReady) {
        throw new Error("Like feature not yet available");
      }

      toast.success(newIsLiked ? "Added to liked videos" : "Removed from liked videos");
    } catch (error) {
      setIsLiked(isLiked);
      setLikeCount(initialLikeCount);
      
      toast.error("Couldn't save your preference", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLike}
      disabled={isLoading}
      className={`rounded-l-full px-4 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
        isLiked ? "text-electric-lime" : ""
      }`}
    >
      <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      {formatCount(likeCount)}
    </Button>
  );
}
