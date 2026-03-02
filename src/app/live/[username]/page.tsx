import { getLiveStreams } from "@/actions/stream";
import { getChannelByHandle } from "@/actions/channel";
import { getVideos } from "@/actions/video";
import { LiveVideoPlayer } from "@/components/LiveVideoPlayer";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { LiveChat } from "@/features/chat/components/LiveChat";
import { LiveViewerCount } from "@/components/LiveViewerCount";
import { Stream } from "@/types/api";
import { VideoCard } from "@/features/video/components/VideoCard";
import { cn } from "@/lib/utils";

import { SubscribeButton } from "@/features/video/components/SubscribeButton";

interface LiveStreamPageProps {
  params: Promise<{
    username: string;
  }>;
}

export const revalidate = 30;

export default async function LiveStreamPage({ params }: LiveStreamPageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const cleanUsername = decodedUsername.replace("@", "");

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  // Find the stream for this user
  const streams = await getLiveStreams({ limit: 50 });
  let stream = streams.find(s => {
    const streamUsername = s.streamer?.username || s.creator?.username;
    return streamUsername === decodedUsername || streamUsername === cleanUsername || s.id === decodedUsername || s.id === cleanUsername;
  });

  let recentVideos: import("@/types/api").Video[] = [];

  // If not live, check if the channel exists
  if (!stream) {
    const channel = await getChannelByHandle(decodedUsername);
    if (!channel) {
      notFound();
    }

    const videosRes = await getVideos({ channelId: channel.id, limit: 4, sort: "latest" });
    recentVideos = videosRes.videos || [];

    // Create a fallback stream object for the offline state
    stream = {
      id: channel.id,
      userId: channel.userId,
      title: `${channel.name}'s Terminal`,
      category: "Offline",
      status: "offline",
      viewerCount: 0,
      creator: {
        id: channel.userId,
        username: channel.handle,
        avatarUrl: channel.avatarUrl,
        subscribers: channel.subscriberCount.toString(),
      },
      streamer: {
        id: channel.userId,
        username: channel.handle,
        avatarUrl: channel.avatarUrl,
        subscribers: channel.subscriberCount.toString(),
      },
    } as Stream;
  }

  const streamerInfo = stream.streamer || stream.creator;
  const hasRealHlsUrl = stream.hlsPlaybackUrl?.endsWith(".m3u8") ?? false;
  const isLive = stream.status === "live";

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col lg:flex-row bg-noir-bg overflow-hidden">
      {/* Main Video & Info Section */}
      <div className="flex-1 w-full flex flex-col min-h-0 overflow-y-auto no-scrollbar">
        <div className={cn("flex-1 min-h-0 flex flex-col lg:p-6 gap-8", !isLive && "max-w-7xl mx-auto w-full")}>
          {/* Video Player area */}
          <div className="w-full aspect-video bg-black shrink-0 lg:rounded-[2rem] overflow-hidden shadow-2xl border-b lg:border border-white/5 relative group">
            {hasRealHlsUrl ? (
              <LiveVideoPlayer hlsUrl={stream.hlsPlaybackUrl!} poster={stream.thumbnailUrl} autoplay={true} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#080808] relative">
                <div className="text-center space-y-6 lg:space-y-10 relative z-20 p-4">
                  <div className="relative">
                    <div className="w-16 h-16 lg:w-24 lg:h-24 mx-auto rounded-2xl lg:rounded-[2rem] bg-white/[0.02] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-electric-lime/20 transition-all duration-700">
                      {stream.status === "offline" ? (
                        <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl border border-white/5 flex items-center justify-center bg-noir-bg/30">
                          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-white/5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 lg:w-12 lg:h-12 border-2 border-white/5 border-t-electric-lime rounded-full animate-spin" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-white text-xl lg:text-3xl font-black uppercase tracking-tight">{stream.status === "offline" ? "Station Offline" : "Standing By..."}</h2>
                    <p className="text-white/20 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] lg:tracking-[0.4em] px-4">
                      {stream.status === "offline" ? "Return later for the next broadcast" : "Establishing Connection"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stream Info Area */}
          <div className="px-4 lg:px-6 pb-6 space-y-6 lg:space-y-8 group/info">
            <div className="space-y-4 lg:space-y-6 min-w-0">
              <div className="flex items-center gap-3 lg:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
                {stream.status === "live" ? (
                  <div className="flex items-center gap-2 bg-signal-red/10 border border-signal-red/20 px-3 lg:px-4 py-1.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-signal-red animate-pulse shadow-[0_0_15px_rgba(255,49,49,0.5)]" />
                    <span className="text-[9px] lg:text-[10px] font-black text-signal-red uppercase tracking-[0.2em]">Live Broadcast</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 lg:px-4 py-1.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white/10" />
                    <span className="text-[9px] lg:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Terminal Offline</span>
                  </div>
                )}
                <div className="h-px w-4 lg:w-8 bg-white/10 shrink-0" />
                <p className="text-electric-lime text-[9px] lg:text-[10px] font-mono font-black uppercase tracking-[0.3em] shrink-0">{stream.category || "General Broadcast"}</p>
              </div>
              <h1 className="text-xl md:text-3xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight lg:leading-[0.9] group-hover/info:text-electric-lime transition-all duration-500 break-words">
                {stream.title}
              </h1>
            </div>

            <div className="flex items-center justify-between p-3 lg:p-6 bg-white/[0.02] border border-white/5 rounded-2xl lg:rounded-[2.5rem] transition-all duration-500 hover:bg-white/[0.04]">
              <div className="flex items-center gap-3 lg:gap-6 min-w-0">
                <Link href={`/${streamerInfo?.username}`} className="flex items-center gap-3 lg:gap-5 group/streamer min-w-0">
                  <div className="w-10 h-10 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-0.5 lg:p-1 group-hover/streamer:border-electric-lime transition-all duration-500">
                    <div className="w-full h-full rounded-lg lg:rounded-xl overflow-hidden relative bg-noir-bg">
                      {streamerInfo?.avatarUrl ? (
                        <Image src={streamerInfo.avatarUrl} alt={streamerInfo.username || "Streamer"} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-lg lg:text-2xl font-black uppercase tracking-tighter">
                          {(streamerInfo?.username || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm lg:text-xl text-white group-hover/streamer:text-electric-lime transition-colors duration-300 truncate tracking-tight uppercase">
                      {streamerInfo?.username || "Unknown"}
                    </p>
                    <p className="hidden lg:block text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-0.5">Operator</p>
                  </div>
                </Link>

                <div className="scale-75 lg:scale-100 origin-left shrink-0">
                  <SubscribeButton channelId={stream.userId} channelName={streamerInfo?.username || "Channel"} />
                </div>
              </div>

              {stream.status === "live" && (
                <div className="bg-noir-terminal/50 lg:bg-noir-terminal border border-white/5 lg:border-white/10 px-3 lg:px-6 py-2 lg:py-4 rounded-xl lg:rounded-[2rem] shadow-xl backdrop-blur-xl shrink-0 ml-2">
                  <LiveViewerCount streamId={stream.id} initialCount={stream.viewerCount || 0} />
                </div>
              )}
            </div>

            {/* Recent Offline Archives Section */}
            {!isLive && recentVideos.length > 0 && (
              <div className="pt-10 lg:pt-20 space-y-6 lg:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex items-center gap-4 lg:gap-6">
                  <h3 className="text-[10px] lg:text-[12px] font-black text-white uppercase tracking-[0.4em] lg:tracking-[0.6em] whitespace-nowrap">Broadcast Archives</h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {recentVideos.map(video => (
                    <VideoCard key={video.id} {...video} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Section */}
      {isLive && (
        <div className="w-full lg:w-96 shrink-0 h-[45vh] lg:h-full lg:border-l border-t lg:border-t-0 border-white/5 bg-noir-terminal flex flex-col shadow-2xl z-10">
          <div className="flex-1 min-h-0 bg-noir-terminal flex flex-col">
            <LiveChat streamId={stream.id} token={token} />
          </div>
        </div>
      )}
    </div>
  );
}
