import { getVideos } from "@/actions/video";
import { VideoCard } from "@/features/video/components/VideoCard";

export default async function VideosPage() {
  const { videos } = await getVideos({ limit: 50, sort: "latest" });

  return (
    <div className="container mx-auto p-6 lg:p-10 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Latest Uploads</h1>
        <p className="text-muted-text">Explore the newest videos from our community.</p>
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-noir-border rounded-xl bg-noir-terminal/50">
          <p className="text-xl font-medium text-foreground">No videos found</p>
          <p className="text-muted-text mt-2">Check back later for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      )}
    </div>
  );
}
