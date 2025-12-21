import { getLiveStreams } from "@/actions/stream";
import { VideoCard } from "@/features/video/components/VideoCard";

export const revalidate = 60;

export default async function LivePage() {
  const streams = await getLiveStreams({ limit: 50 });

  return (
    <div className="container mx-auto p-6 lg:p-10 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-signal-red animate-pulse" />
            Live Streams    
        </h1> 
        <p className="text-muted-text">Watch live broadcasts happening right now.</p>
      </div>

      {streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-noir-border rounded-xl bg-noir-terminal/50">
          <p className="text-xl font-medium text-foreground">No live streams currently</p>
          <p className="text-muted-text mt-2">Check back later or start your own stream!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {streams.map((stream) => (
            <VideoCard
                key={stream.id}
                id={stream.id}
                title={stream.title}
                thumbnailUrl={stream.thumbnailUrl || "/placeholder.jpg"}
                duration="LIVE"
                views={stream.viewerCount}
                uploadedAt="Live"
                isLive={true}
                creator={stream.streamer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
