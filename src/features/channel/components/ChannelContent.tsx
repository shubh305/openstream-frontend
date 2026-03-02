"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubscribeButton } from "@/features/video/components/SubscribeButton";
import { Channel, Video, Stream, Playlist } from "@/types/api";
import { VideoCard } from "@/features/video/components/VideoCard";
import { cn } from "@/lib/utils";

interface ChannelContentProps {
  channel: Channel;
  videos: Video[];
  pastStreams?: Video[];
  liveStreams: Stream[];
  playlists: Playlist[];
  isOwner: boolean;
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-white/20 border border-white/5 rounded-[2.5rem] bg-white/[0.01] animate-in fade-in duration-700">
    <div className="w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center mb-6 opacity-50">
      <div className="w-3 h-3 rounded-full bg-white/5" />
    </div>
    <p className="text-sm md:text-base font-black uppercase tracking-[0.4em] text-center px-6 leading-relaxed">{message}</p>
  </div>
);

export function ChannelContent({ channel, videos, pastStreams = [], liveStreams, playlists, isOwner }: ChannelContentProps) {
  const [activeTab, setActiveTab] = useState("Videos");

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* ... (backgrounds unchanged) ... */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#1a1a1a] to-transparent -z-10 pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-electric-lime/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 flex gap-10">
        {/* Left Sidebar (Channel Info Card) */}
        <aside className="hidden lg:block w-80 shrink-0 space-y-6 sticky top-24 h-fit">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl">
            <div className="w-32 h-32 rounded-full border-4 border-[#050505] bg-noir-terminal flex items-center justify-center shadow-lg mb-4 relative">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image
                  src={channel.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${channel.handle}`}
                  alt={channel.name}
                  fill
                  className="object-cover grayscale"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {liveStreams.length > 0 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-signal-red px-2 py-0.5 rounded-md text-[8px] font-black text-white uppercase tracking-widest shadow-[0_4px_10px_rgba(239,68,68,0.5)] z-20">
                  Live
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-1 truncate w-full" title={channel.name}>
              {channel.name}
            </h1>
            <p className="text-sm text-white/50 mb-6 truncate w-full">@{channel.handle}</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="text-xl font-bold">{channel.subscriberCount}</div>
                <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">Subscribers</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="text-xl font-bold">{videos.length + pastStreams.length}</div>
                <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">Videos</div>
              </div>
            </div>

            <Link href={`/live/@${channel.handle}`} className="w-full mb-3">
              <Button
                className={cn(
                  "w-full rounded-full h-11 font-black uppercase tracking-widest text-[10px] transition-all duration-500",
                  liveStreams.length > 0
                    ? "bg-signal-red hover:bg-signal-red/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    : "bg-white/5 hover:bg-white/10 text-white/60 border border-white/10",
                )}
              >
                {liveStreams.length > 0 ? "Watch Live Now" : "Stream Terminal"}
              </Button>
            </Link>

            {!isOwner && (
              <div className="w-full mb-3">
                <SubscribeButton channelId={channel.id} channelName={channel.name} initialIsSubscribed={channel.isSubscribed} />
              </div>
            )}

            {isOwner && (
              <Link href="/studio/customization" className="w-full">
                <Button variant="outline" className="w-full rounded-full border-white/10 hover:bg-white/10 text-white/80 h-10">
                  Customize
                </Button>
              </Link>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <h3 className="text-sm font-bold tracking-widest text-white/60 mb-4">About</h3>
            <p className="text-sm text-white/70 leading-relaxed line-clamp-4">{channel.description || "No description provided."}</p>
            {channel.socialLinks && (
              <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                {/* Social Icons */}
                {channel.socialLinks.twitter && (
                  <a
                    href={channel.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    Tw
                  </a>
                )}
                {channel.socialLinks.discord && (
                  <a
                    href={channel.socialLinks.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    Ds
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-noir-terminal flex items-center justify-center border-2 border-white/10 overflow-hidden relative">
              <Image src={channel.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${channel.handle}`} alt={channel.name} fill className="object-cover grayscale" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold truncate">{channel.name}</h1>
              <p className="text-sm text-white/50 truncate">
                @{channel.handle} • {channel.subscriberCount} subscribers
              </p>
            </div>
          </div>

          {/* Pill Navigation */}
          {/* ... unchanged ... */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
            {["Videos", "Live", "Playlists", "About"].map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                            px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer
                            ${isActive ? "bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}
                        `}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {activeTab === "Videos" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] flex items-center gap-4 text-white/40">
                    <span className="w-8 h-px bg-white/10" />
                    Latest Broadcasts
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {videos.map(video => (
                    <VideoCard key={video.id} {...video} />
                  ))}
                </div>
                {videos.length === 0 && <EmptyState message="No broadcast records found in the archive" />}
              </section>
            )}

            {activeTab === "Live" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] flex items-center gap-4 text-white/40">
                    <span className="w-8 h-px bg-white/10" />
                    Live Content
                  </h2>
                </div>
                {liveStreams.length > 0 || pastStreams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {liveStreams.map(stream => (
                      <VideoCard
                        key={stream.id}
                        id={stream.id}
                        title={stream.title}
                        thumbnailUrl={stream.thumbnailUrl || ""}
                        duration="LIVE"
                        views={stream.viewerCount || 0}
                        uploadedAt="JUST NOW"
                        creator={stream.creator}
                        isLive={true}
                      />
                    ))}
                    {pastStreams.map(video => (
                      <VideoCard key={video.id} {...video} />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No active transmissions or past records" />
                )}
              </section>
            )}

            {activeTab === "Playlists" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] flex items-center gap-4 text-white/40">
                    <span className="w-8 h-px bg-white/10" />
                    Playlists
                  </h2>
                </div>
                {playlists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {playlists.map(playlist => (
                      <Link key={playlist.id} href={`/playlist?list=${playlist.id}`} className="block group">
                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 group-hover:border-white/20 transition-all duration-500">
                          <div className="absolute inset-0 bg-white/[0.02]" />
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/60 transition-colors">
                            Playlist Folder
                          </div>
                        </div>
                        <h3 className="mt-4 font-bold text-lg text-white group-hover:text-electric-lime transition-all duration-300">{playlist.title}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">{playlist.videoCount || 0} Records</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No categorized collections found" />
                )}
              </section>
            )}

            {activeTab === "About" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Description</h3>
                    <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{channel.description || "No description."}</p>
                  </div>

                  <div className="h-[1px] bg-white/10" />

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-white/40 tracking-widest text-xs">Location</span>
                        <span className="text-white">Earth</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/10" />

                  <div className="flex gap-8">
                    <div>
                      <p className="text-2xl font-bold text-white">{channel.joinedDate || "N/A"}</p>
                      <p className="text-[10px] tracking-widest text-white/40 mt-1">Joined</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{channel.totalViews}</p>
                      <p className="text-[10px] tracking-widest text-white/40 mt-1">Total views</p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
