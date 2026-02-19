import { getLiveStreams } from "@/actions/stream";
import { LiveVideoPlayer } from "@/components/LiveVideoPlayer";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { LiveChat } from "@/features/chat/components/LiveChat";
import { LiveViewerCount } from "@/components/LiveViewerCount";

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
  
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  
  // Find the stream for this user
  const streams = await getLiveStreams({ limit: 50 });
  const stream = streams.find(s => {
    const streamUsername = s.streamer?.username || s.creator?.username;
    return streamUsername === decodedUsername || s.id === decodedUsername;
  });

  if (!stream) {
    notFound();
  }

  const streamerInfo = stream.streamer || stream.creator;
  const hasRealHlsUrl = stream.hlsPlaybackUrl?.endsWith('.m3u8') ?? false;

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col lg:flex-row bg-noir-bg overflow-hidden">
      {/* Main Video & Info Section */}
      <div className="flex-1 w-full flex flex-col min-h-0 overflow-y-auto lg:overflow-visible no-scrollbar">
        <div className="flex-1 min-h-0 flex flex-col lg:p-6 gap-4 lg:gap-6">
          {/* Video Player */}
          <div className="w-full aspect-video bg-black shrink-0 lg:rounded-xl overflow-hidden shadow-2xl border-b lg:border border-noir-border relative group">
            {hasRealHlsUrl ? (
              <LiveVideoPlayer hlsUrl={stream.hlsPlaybackUrl!} poster={stream.thumbnailUrl} autoplay={true} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-noir-terminal/50 backdrop-blur-sm">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-noir-border/30 flex items-center justify-center animate-pulse">
                    <div className="w-10 h-10 border-2 border-muted-text/30 border-t-electric-lime rounded-full animate-spin" />
                  </div>
                  <div>
                    <p className="text-white font-bold tracking-wide">STREAM STARTING</p>
                    <p className="text-muted-text text-xs font-mono mt-1">Status check: {stream.status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stream Info */}
          <div className="px-4 pb-4 lg:px-0 space-y-4 lg:space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight line-clamp-2">{stream.title}</h1>
                <p className="text-electric-lime text-xs font-mono font-medium uppercase tracking-wider">{stream.category || "Just Chatting"}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-signal-red/10 border border-signal-red/20 px-2 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-red animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  <span className="text-[10px] font-bold text-signal-red uppercase tracking-wider">Live</span>
                </div>
                <div className="flex items-center gap-1.5 bg-noir-terminal border border-noir-border px-2 py-1 rounded-md">
                  <LiveViewerCount streamId={stream.id} initialCount={stream.viewerCount || 0} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 lg:p-4 bg-noir-terminal/50 backdrop-blur-sm rounded-xl border border-noir-border">
              <Link href={`/${streamerInfo?.username}`} className="flex items-center gap-3 group min-w-0">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden bg-noir-border border-2 border-transparent group-hover:border-electric-lime transition-all p-0.5 shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-noir-bg">
                    {streamerInfo?.avatarUrl ? (
                      <Image src={streamerInfo.avatarUrl} alt={streamerInfo.username || "Streamer"} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">{(streamerInfo?.username || "U")[0].toUpperCase()}</div>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm lg:text-base text-white group-hover:text-electric-lime transition-colors truncate">{streamerInfo?.username || "Unknown"}</p>
                  <p className="text-xs text-muted-text truncate">@{streamerInfo?.username}</p>
                </div>
              </Link>

              <SubscribeButton channelId={stream.userId} channelName={streamerInfo?.username || "Channel"} />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full lg:w-96 shrink-0 h-[45vh] lg:h-full lg:border-l border-t lg:border-t-0 border-noir-border bg-noir-terminal flex flex-col shadow-2xl z-10">
        <div className="flex-1 min-h-0 bg-noir-terminal flex flex-col">
          <LiveChat streamId={stream.id} token={token} />
        </div>
      </div>
    </div>
  );
}
