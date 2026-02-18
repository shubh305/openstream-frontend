"use client";

import { useState } from "react";
import { Video } from "@/types/api";
import { Button } from "@/components/ui/button";
import { deleteVideo } from "@/actions/video";
import { toast } from "sonner";
import { X, Loader2, AlertTriangle } from "lucide-react";

interface DeleteVideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteVideoModal({ video, isOpen, onClose, onSuccess }: DeleteVideoModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !video) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteVideo(video.id);
      toast.success("Video deleted successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to delete video");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-xl border border-signal-red/30 bg-noir-terminal p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-signal-red" />
            Delete video
          </h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10 text-muted-text hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-muted-text mb-6">
          Are you sure you want to delete <span className="text-foreground font-semibold">&quot;{video.title}&quot;</span>? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-noir-border">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="hover:bg-white/10 hover:text-white"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            className="bg-signal-red text-white hover:bg-signal-red/90 font-semibold" 
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete forever
          </Button>
        </div>
      </div>
    </div>
  );
}
