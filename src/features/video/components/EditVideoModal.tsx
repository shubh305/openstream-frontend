"use client";

import { useState, useEffect } from "react";
import { Video } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateVideo, UpdateVideoData } from "@/actions/video";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

interface EditVideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditVideoModal({ video, isOpen, onClose, onSuccess }: EditVideoModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateVideoData>({
    title: "",
    description: "",
    visibility: "private",
  });

  // Update form data when video changes or modal opens
  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description || "",
        visibility: video.visibility || "private",
      });
    }
  }, [video, isOpen]);

  if (!isOpen || !video) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateVideo(video.id, {
        title: formData.title,
        description: formData.description,
        visibility: formData.visibility,
      });
      toast.success("Video updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update video");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-xl border border-noir-border bg-noir-terminal p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit video details</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10 text-muted-text hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-noir-bg border-noir-border text-foreground focus:border-electric-lime"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-noir-bg border-noir-border min-h-[100px] text-foreground focus:border-electric-lime resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility" className="text-foreground">Visibility</Label>
            <select
              id="visibility"
              className="flex h-10 w-full rounded-md border border-noir-border bg-noir-bg px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-lime focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground transition-colors"
              value={formData.visibility}
              onChange={(e) => setFormData({...formData, visibility: e.target.value as "public" | "private" | "unlisted"})}
            >
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-noir-border">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-electric-lime text-black hover:bg-electric-lime/90 font-semibold" 
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
