import { VideoGrid } from "@/features/video/components/VideoGrid";
import { MOCK_VIDEOS } from "@/lib/mock-data";

/**
 * Landing Page Component
 * Displays a grid of trending and recommended videos.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      
      <div className="container mx-auto px-4 py-8">
        <VideoGrid title="Trending Now" videos={MOCK_VIDEOS} />
        
        {/* Duplicate for demo purposes */}
        <VideoGrid title="Recommended" videos={[...MOCK_VIDEOS].reverse()} />
      </div>
    </div>
  );
}
