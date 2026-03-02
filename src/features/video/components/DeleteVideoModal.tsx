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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div
        className="w-full max-w-lg rounded-[2.5rem] border border-white/5 bg-noir-terminal p-10 shadow-[0_0_100px_rgba(0,0,0,1)] relative animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative background pulse */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-signal-red/5 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-signal-red/10 flex items-center justify-center border border-signal-red/20">
              <AlertTriangle className="w-6 h-6 text-signal-red shadow-[0_0_15px_rgba(255,49,49,0.3)]" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Delete video</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-muted-text hover:text-white transition-all transform hover:rotate-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          <p className="text-white/60 text-lg font-medium leading-relaxed">
            Are you sure you want to delete <br />
            <span className="block mt-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-white font-mono break-all text-sm leading-relaxed shadow-inner">&quot;{video.title}&quot;</span>
            <span className="block mt-4 text-white/40 text-sm uppercase font-black tracking-widest">This action cannot be undone.</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-6 mt-12 pt-10 border-t border-white/5 relative z-10">
          <Button variant="ghost" onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white hover:bg-white/5 transition-all" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="h-16 px-10 rounded-[20px] bg-signal-red text-white hover:bg-signal-red/90 font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_10px_30px_rgba(255,49,49,0.2)] hover:shadow-[0_15px_40px_rgba(255,49,49,0.3)] transform hover:-translate-y-1 transition-all"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete forever"}
          </Button>
        </div>
      </div>
    </div>
  );
}
