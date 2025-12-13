"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { toggleSubscription } from "@/actions/subscription";

interface SubscribeButtonProps {
  channelId: string;
  channelName: string;
  initialIsSubscribed?: boolean;
}

// channelId is intentionally captured for future backend API integration
export function SubscribeButton({ 
  channelId, 
  channelName, 
  initialIsSubscribed = false 
}: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      const result = await toggleSubscription(channelId, isSubscribed);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update subscription");
      }

      const newIsSubscribed = !isSubscribed;
      setIsSubscribed(newIsSubscribed);
      
      if (newIsSubscribed) {
        toast.success(`Subscribed to ${channelName}`, {
          description: "You'll be notified when they go live",
        });
      } else {
        toast.success(`Unsubscribed from ${channelName}`);
      }
    } catch (error) {
      toast.error("Couldn't update subscription", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      variant={isSubscribed ? "outline" : "default"}
      className={`ml-4 rounded-full font-medium transition-all ${
        isSubscribed 
          ? "border-electric-lime text-electric-lime hover:bg-electric-lime/10" 
          : "bg-electric-lime text-black hover:bg-electric-lime/90"
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        "Subscribed"
      ) : (
        "Subscribe"
      )}
    </Button>
  );
}
