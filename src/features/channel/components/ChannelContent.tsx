"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MoreVertical, Play } from "lucide-react";
import Link from "next/link";
import { SubscribeButton } from "@/features/video/components/SubscribeButton";
import { Channel, Video, Stream, Playlist } from "@/types/api";

interface ChannelContentProps {
  channel: Channel;
  videos: Video[];
  liveStreams: Stream[];
  playlists: Playlist[];
  isOwner: boolean;
}

export function ChannelContent({ channel, videos, liveStreams, playlists, isOwner }: ChannelContentProps) {
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
              <div className="w-32 h-32 rounded-full border-4 border-[#050505] bg-noir-terminal flex items-center justify-center shadow-lg mb-4 relative overflow-hidden">
                  <Image 
                    src={channel.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${channel.handle}`} 
                    alt={channel.name}
                    fill
                    className="object-cover grayscale"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
              </div>
              
              <h1 className="text-2xl font-bold tracking-tight mb-1 truncate w-full" title={channel.name}>{channel.name}</h1>
              <p className="text-sm text-white/50 mb-6 truncate w-full">@{channel.handle}</p>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-6">
                 <div className="bg-white/5 rounded-2xl p-3">
                     <div className="text-xl font-bold">{channel.subscriberCount}</div>
                     <div className="text-[10px] text-white/40 uppercase tracking-wider">Subs</div>
                 </div>
                 <div className="bg-white/5 rounded-2xl p-3">
                     <div className="text-xl font-bold">{channel.videoCount}</div>
                     <div className="text-[10px] text-white/40 uppercase tracking-wider">Videos</div>
                 </div>
              </div>

              {!isOwner && (
                 <div className="w-full mb-3">
                    <SubscribeButton 
                        channelId={channel.id} 
                        channelName={channel.name} 
                        initialIsSubscribed={channel.isSubscribed}
                    />
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
               <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-4">About</h3>
               <p className="text-sm text-white/70 leading-relaxed line-clamp-4">
                   {channel.description || "No description provided."}
               </p>
               {channel.socialLinks && (
                   <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                       {/* Social Icons */}
                       {channel.socialLinks.twitter && <a href={channel.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">Tw</a>}
                       {channel.socialLinks.discord && <a href={channel.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">Ds</a>}
                   </div>
               )}
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
           
           {/* Mobile Header */}
           <div className="lg:hidden mb-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-noir-terminal flex items-center justify-center border-2 border-white/10 overflow-hidden relative">
                <Image 
                    src={channel.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${channel.handle}`} 
                    alt={channel.name}
                    fill
                    className="object-cover grayscale"
                  />
              </div>
              <div className="min-w-0">
                  <h1 className="text-2xl font-bold truncate">{channel.name}</h1>
                  <p className="text-sm text-white/50 truncate">@{channel.handle} • {channel.subscriberCount} subscribers</p>
              </div>
           </div>

           {/* Pill Navigation */}
           {/* ... unchanged ... */}
           <div className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
              {["Videos", "Live", "Playlists", "About"].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                            ${isActive 
                                ? "bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105" 
                                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                            }
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
                <>
                  <section>
                      <div className="flex items-center justify-between mb-6">
                          <h2 className="text-lg font-bold flex items-center gap-2">
                              <span className="w-1.5 h-6 bg-electric-lime rounded-full" />
                              Latest Uploads
                          </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {videos.map((video) => (
                              <HubVideoCard key={video.id} video={video} />
                          ))}
                          {videos.length === 0 && <p className="text-white/40">No videos uploaded yet.</p>}
                      </div>
                  </section>
                </>
              )}
              
              {activeTab === "Live" && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                          <h2 className="text-lg font-bold flex items-center gap-2">
                              <span className="w-1.5 h-6 bg-signal-red rounded-full shadow-[0_0_10px_#ef4444]" />
                              Live Streams
                          </h2>
                    </div>
                    {liveStreams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {liveStreams.map((stream) => (
                                <HubStreamCard key={stream.id} stream={stream} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-white/30 border border-white/5 rounded-2xl bg-white/[0.02]">
                            <p className="text-lg">No past live streams available.</p>
                        </div>
                    )}
                 </section>
              )}

              {activeTab === "Playlists" && (
                 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {playlists.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {playlists.map((playlist) => (
                                <Link key={playlist.id} href={`/playlist?list=${playlist.id}`} className="block">
                                    <div className="group relative bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl aspect-video flex items-center justify-center bg-noir-terminal">
                                         <span className="text-lg font-bold text-white group-hover:text-electric-lime">{playlist.title}</span>
                                         <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <h3 className="mt-3 font-bold text-white truncate">{playlist.title}</h3>
                                    <p className="text-xs text-muted-text">{playlist.videoCount || 0} videos</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                         <p className="text-white/40">No playlists available.</p>
                    )}
                 </section>
              )}
              
              {activeTab === "About" && (
                   <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
                       <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                           <div>
                               <h3 className="text-lg font-bold text-white mb-4">Description</h3>
                               <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                                   {channel.description || "No description."}
                               </p>
                           </div>
                           
                           <div className="h-[1px] bg-white/10" />
                           
                           <div>
                               <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                       <span className="text-white/40 uppercase tracking-widest text-xs">Location</span>
                                       <span className="text-white">Earth</span>
                                   </div>
                               </div>
                           </div>
                           
                            <div className="h-[1px] bg-white/10" />
                            
                            <div className="flex gap-8">
                                <div>
                                    <p className="text-2xl font-bold text-white">{channel.joinedDate || "N/A"}</p>
                                    <p className="text-xs uppercase tracking-widest text-white/40 mt-1">Joined</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{channel.totalViews}</p>
                                    <p className="text-xs uppercase tracking-widest text-white/40 mt-1">Total Views</p>
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

function HubVideoCard({ video }: { video: Video }) {
    return (
        <Link href={`/watch/${video.id}`} className="block">
            <div className="group relative bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                {/* Thumbnail Area */}
                <div className="aspect-video relative overflow-hidden">
                     <Image 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                     />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold font-mono border border-white/10">
                        {video.duration}
                    </div>
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 relative">
                    <h3 className="font-bold text-white leading-snug line-clamp-2 mb-2 group-hover:text-electric-lime transition-colors">
                        {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-white/40">
                        <div className="flex items-center gap-2">
                            <span>{video.views ? video.views.toLocaleString() : 0} views</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-white/40" />
                            <span>{video.uploadedAt}</span>
                        </div>
                        <MoreVertical className="w-4 h-4 hover:text-white cursor-pointer" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function HubStreamCard({ stream }: { stream: Stream }) {
    return (
         <Link href={`/live/${stream.streamer.username}`} className="block">
            <div className="group relative bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden hover:border-electric-lime/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                {/* Thumbnail Area */}
                <div className="aspect-video relative overflow-hidden">
                     <Image 
                        src={stream.thumbnailUrl || "/placeholder.jpg"} 
                        alt={stream.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                     />
                    <div className="absolute top-3 left-3 bg-signal-red px-2 py-1 rounded text-xs font-bold text-white uppercase animate-pulse">Live</div>
                </div>

                {/* Content Area */}
                <div className="p-4">
                    <h3 className="font-bold text-white leading-snug line-clamp-2 mb-2 group-hover:text-electric-lime transition-colors">
                        {stream.title}
                    </h3>
                    <p className="text-white/40 text-xs">{stream.viewerCount} watching</p>
                </div>
            </div>
        </Link>
    );
}
