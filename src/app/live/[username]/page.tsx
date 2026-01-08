import { getLiveStreams } from "@/actions/stream";
import { LiveVideoPlayer } from "@/components/LiveVideoPlayer";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface LiveStreamPageProps {
  params: Promise<{
    username: string;
  }>;
}

export const revalidate = 30;

export default async function LiveStreamPage({ params }: LiveStreamPageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  
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
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      {/* Main Video Section */}
      <div className="flex-1">
        {/* Video Player */}
        <div className="aspect-video bg-noir-terminal rounded-xl overflow-hidden">
          {hasRealHlsUrl ? (
            <LiveVideoPlayer
              hlsUrl={stream.hlsPlaybackUrl!}
              poster={stream.thumbnailUrl}
              autoplay={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-noir-border flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-muted-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Stream Starting...</p>
                <p className="text-muted-text text-sm">Please wait for the stream to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="mt-4 space-y-4">
          <h1 className="text-2xl font-bold text-white">{stream.title}</h1>
          
          <div className="flex items-center justify-between">
            <Link href={`/${streamerInfo?.username}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-noir-border">
                {streamerInfo?.avatarUrl ? (
                  <Image
                    src={streamerInfo.avatarUrl}
                    alt={streamerInfo.username || "Streamer"}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                    {(streamerInfo?.username || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-white group-hover:text-electric-lime transition-colors">
                  {streamerInfo?.username || "Unknown"}
                </p>
                <p className="text-sm text-muted-text">
                  {stream.category || "Just Chatting"}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Viewer count */}
              <div className="flex items-center gap-2 text-muted-text">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  {Intl.NumberFormat("en-US", { notation: "compact" }).format(stream.viewerCount || 0)} watching
                </span>
              </div>

              {/* LIVE badge */}
              <div className="flex items-center gap-1.5 bg-signal-red px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold text-white uppercase">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section (placeholder for now) */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-noir-terminal rounded-xl border border-noir-border h-[500px] lg:h-full flex flex-col">
          <div className="p-4 border-b border-noir-border">
            <h3 className="font-bold text-white">Stream Chat</h3>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-text text-sm">
            <p>Chat coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
