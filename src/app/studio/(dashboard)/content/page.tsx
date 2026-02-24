"use client";

import { useEffect, useState } from "react";
import { StreamThumbnail } from "@/components/StreamThumbnail";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Loader2, Pencil, Trash2, Video as VideoIcon, Eye } from "lucide-react";
import { getVideos } from "@/actions/video";
import { getMyChannel } from "@/actions/channel";
import { Video } from "@/types/api";
import { EditVideoModal } from "@/features/video/components/EditVideoModal";
import { DeleteVideoModal } from "@/features/video/components/DeleteVideoModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("Videos");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const channel = await getMyChannel();
        if (channel) {
          const isLive = activeTab === "Live";
          const response = await getVideos({
            channelId: channel.id,
            limit: 50,
            sort: "latest",
            isLive,
          });
          setVideos(response.videos || []);
        }
      } catch (e) {
        console.error("Failed to load content", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab, refreshKey]);

  const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-electric-lime" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-electric-lime">Asset Terminal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">Channel Content</h1>
          <p className="text-muted-text font-medium text-sm md:text-base">Manage your broadcast library and collection sequences.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-hover:text-electric-lime transition-colors" />
            <Input
              placeholder="Find broadcast..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-14 md:h-10 pl-12 md:pl-10 bg-white/5 border-white/5 rounded-2xl md:rounded-xl focus:border-white/20 focus:bg-white/10 text-white text-xs md:text-[10px] font-bold uppercase tracking-widest transition-all"
            />
          </div>
          <div className="flex bg-white/5 p-1.5 md:p-1 rounded-[24px] md:rounded-2xl border border-white/10 shrink-0 w-full sm:w-auto">
            {["Videos", "Live"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 sm:flex-none px-6 py-4 md:py-2 rounded-[18px] md:rounded-xl text-[11px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  activeTab === tab ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-electric-lime" />
          <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Decrypting Sequences...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredVideos.length === 0 ? (
            <div className="col-span-full h-96 flex flex-col items-center justify-center text-center p-12 bg-noir-terminal rounded-3xl border border-white/5">
              <VideoIcon className="w-16 h-16 text-white/5 mb-6" />
              <h3 className="text-white text-xl font-black uppercase tracking-widest">Library Empty</h3>
              <p className="text-xs text-muted-text mt-2 font-medium max-w-xs">Initiate your first broadcast sequence to populate your channel terminal.</p>
            </div>
          ) : (
            filteredVideos.map(video => (
              <div key={video.id} className="group bg-noir-terminal border border-white/5 rounded-3xl p-2 hover:border-white/20 transition-colors flex flex-col">
                <Link href={`/watch/${video.id}`} className="relative aspect-video rounded-[24px] overflow-hidden border border-white/5 mb-4 transition-all">
                  <StreamThumbnail url={video.thumbnailUrl} title={video.title} className="w-full h-full opacity-60 group-hover:opacity-100 transition-all duration-500 scale-100" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity md:flex hidden items-center justify-center z-30">
                    <div className="flex gap-3 scale-90 group-hover:scale-100 transition-transform duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black transition-all flex items-center justify-center shadow-xl">
                        <Eye className="w-5 h-5" />
                      </div>
                      <Button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingVideo(video);
                        }}
                        className="w-14 h-14 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-electric-lime hover:text-black hover:border-transparent transition-all"
                      >
                        <Pencil className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeletingVideo(video);
                        }}
                        className="w-14 h-14 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-red-500 hover:border-transparent transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-40">
                    <div
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-black border shadow-2xl",
                        video.visibility === "public" ? "bg-electric-lime/20 text-electric-lime border-electric-lime/30" : "bg-white/10 text-white/60 border-white/20",
                      )}
                    >
                      {video.visibility || "Public"}
                    </div>
                  </div>
                </Link>

                <div className="px-5 pb-6 space-y-5">
                  <div>
                    <Link href={`/watch/${video.id}`}>
                      <h3 className="text-base font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-electric-lime transition-colors">{video.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{video.uploadedAt}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-4 rounded-3xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                    <div className="text-center">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Views</div>
                      <div className="text-xs font-black text-white">{video.views.toLocaleString()}</div>
                    </div>
                    <div className="text-center border-x border-white/5">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Likes</div>
                      <div className="text-xs font-black text-white">{video.likes || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Comments</div>
                      <div className="text-xs font-black text-white">{video.commentsCount || 0}</div>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex md:hidden gap-2 pt-2">
                    <Button
                      onClick={() => setEditingVideo(video)}
                      className="flex-1 h-12 rounded-[20px] bg-white text-black font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl active:scale-95 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Meta
                    </Button>
                    <button
                      onClick={() => setDeletingVideo(video)}
                      className="w-12 h-12 rounded-[20px] bg-white/5 border border-white/10 text-red-500 flex items-center justify-center active:scale-95 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <EditVideoModal video={editingVideo} isOpen={!!editingVideo} onClose={() => setEditingVideo(null)} onSuccess={() => setRefreshKey(k => k + 1)} />
      <DeleteVideoModal video={deletingVideo} isOpen={!!deletingVideo} onClose={() => setDeletingVideo(null)} onSuccess={() => setRefreshKey(k => k + 1)} />
    </div>
  );
}
