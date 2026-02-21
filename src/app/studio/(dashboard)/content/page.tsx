"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StreamThumbnail } from "@/components/StreamThumbnail";
import { Input } from "@/components/ui/input";
import { Search, Globe, Lock, EyeOff, ListVideo, Pencil, Trash2 } from "lucide-react";
import { getVideos } from "@/actions/video";
import { getMyChannel } from "@/actions/channel";
import { getChannelPlaylists, Playlist } from "@/actions/playlist";
import { Video } from "@/types/api";
import { EditVideoModal } from "@/features/video/components/EditVideoModal";
import { DeleteVideoModal } from "@/features/video/components/DeleteVideoModal";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("Videos");
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const channel = await getMyChannel();
        if (channel) {
          if (activeTab === "Playlists") {
            const data = await getChannelPlaylists(channel.id);
            setPlaylists(data);
          } else {
            const isLive = activeTab === "Live";
            const response = await getVideos({
              channelId: channel.id,
              limit: 50,
              sort: "latest",
              isLive,
            });
            setVideos(response.videos || []);
          }
        }
      } catch (e) {
        console.error("Failed to load content", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab, refreshKey]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Channel content</h1>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-noir-border">
        {["Videos", "Live", "Playlists"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab ? "border-electric-lime text-electric-lime" : "border-transparent text-muted-text hover:text-foreground hover:border-muted-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
          <Input placeholder="Filter" className="pl-9 bg-noir-bg border-noir-border focus:border-electric-lime h-9 text-sm text-foreground" />
        </div>
      </div>

      {/* Content Table */}
      <div className="border border-noir-border rounded-lg bg-noir-terminal overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-noir-border text-xs font-medium text-muted-text uppercase tracking-widest bg-noir-bg/50">
          <div className="col-span-12 md:col-span-5 px-9">{activeTab === "Playlists" ? "Playlist" : "Video"}</div>
          <div className="col-span-2 hidden md:block">Visibility</div>
          <div className="col-span-2 hidden md:block">{activeTab === "Playlists" ? "Last Updated" : "Date"}</div>
          <div className="col-span-1 text-right hidden md:block">{activeTab === "Playlists" ? "Video Count" : "Views"}</div>
          <div className="col-span-1 text-right hidden md:block">{activeTab === "Playlists" ? "" : "Comments"}</div>
          <div className="col-span-1 text-right hidden md:block">{activeTab === "Playlists" ? "" : "Likes"}</div>
        </div>

        <div className="divide-y divide-noir-border">
          {loading ? (
            <div className="p-8 text-center text-muted-text">Loading content...</div>
          ) : activeTab === "Playlists" ? (
            playlists.length === 0 ? (
              <div className="p-8 text-center text-muted-text">No playlists found. Create one to organize your content!</div>
            ) : (
              playlists.map(playlist => (
                <div key={playlist.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                  <div className="col-span-12 md:col-span-5 flex items-start gap-4 px-9">
                    <Link
                      href={`/playlist?list=${playlist.id}`}
                      className="w-32 aspect-video bg-noir-bg border border-noir-border rounded overflow-hidden shrink-0 relative group-hover:border-electric-lime transition-colors block"
                    >
                      {playlist.thumbnailUrl ? (
                        <Image src={playlist.thumbnailUrl} alt="" fill sizes="128px" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-noir-bg">
                          <ListVideo className="w-8 h-8 text-muted-text" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded flex items-center gap-1">
                        <ListVideo className="w-3 h-3" />
                        {playlist.videoCount}
                      </div>
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/playlist?list=${playlist.id}`} className="text-sm font-medium text-foreground truncate hover:text-electric-lime transition-colors block">
                        {playlist.title}
                      </Link>
                      <div className="text-xs text-muted-text mt-1 line-clamp-1">{playlist.description || "No description"}</div>
                      <p className="text-xs text-muted-text mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <button className="hover:text-electric-lime font-medium">Edit</button>
                        <span>•</span>
                        <button className="hover:text-electric-lime font-medium">Videos</button>
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 hidden md:block">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Globe className="w-4 h-4 text-muted-text" />
                      <span className="capitalize">Public</span>
                    </div>
                  </div>

                  <div className="col-span-2 hidden md:block">
                    <div className="text-sm text-foreground">{playlist.updatedAt && !isNaN(new Date(playlist.updatedAt).getTime()) ? new Date(playlist.updatedAt).toLocaleDateString() : "N/A"}</div>
                    <div className="text-xs text-muted-text">Updated</div>
                  </div>

                  <div className="col-span-1 text-right text-sm text-foreground hidden md:block">{playlist.videoCount}</div>
                  <div className="col-span-1 hidden md:block"></div>
                  <div className="col-span-1 hidden md:block"></div>
                </div>
              ))
            )
          ) : videos.length === 0 ? (
            <div className="p-8 text-center text-muted-text">No videos found. Upload one to get started!</div>
          ) : (
            videos.map(video => (
              <div key={video.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                <div className="col-span-12 md:col-span-5 flex items-start gap-4 px-9">
                  <Link href={`/watch/${video.id}`} className="w-32 aspect-video bg-noir-bg border border-noir-border rounded overflow-hidden shrink-0 relative block">
                    <StreamThumbnail
                      url={video.thumbnailUrl}
                      title={video.title}
                      avatarUrl={video.creator?.avatarUrl}
                      avatarFallback={(video.creator?.username || video.title || "V")[0].toUpperCase()}
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/watch/${video.id}`} className="text-sm font-medium text-foreground truncate hover:text-electric-lime transition-colors block">
                      {video.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingVideo(video)} className="flex items-center gap-1.5 text-xs font-medium text-muted-text hover:text-electric-lime transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button onClick={() => setDeletingVideo(video)} className="flex items-center gap-1.5 text-xs font-medium text-muted-text hover:text-signal-red transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 hidden md:block">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    {video.visibility === "public" ? (
                      <Globe className="w-4 h-4 text-electric-lime" />
                    ) : video.visibility === "private" ? (
                      <Lock className="w-4 h-4 text-signal-red" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-text" />
                    )}
                    <span className="capitalize">{video.visibility || "Public"}</span>
                  </div>
                </div>

                <div className="col-span-2 hidden md:block">
                  <div className="text-sm text-foreground">{video.uploadedAt}</div>
                  <div className="text-xs text-muted-text">Published</div>
                </div>

                <div className="col-span-1 text-right text-sm text-foreground hidden md:block">{Intl.NumberFormat("en-US", { notation: "compact" }).format(video.views)}</div>
                <div className="col-span-1 text-right text-sm text-foreground hidden md:block">{video.commentsCount || 0}</div>
                <div className="col-span-1 text-right text-sm text-foreground hidden md:block">{video.likes || 0}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <EditVideoModal video={editingVideo} isOpen={!!editingVideo} onClose={() => setEditingVideo(null)} onSuccess={() => setRefreshKey(k => k + 1)} />

      <DeleteVideoModal video={deletingVideo} isOpen={!!deletingVideo} onClose={() => setDeletingVideo(null)} onSuccess={() => setRefreshKey(k => k + 1)} />
    </div>
  );
}
