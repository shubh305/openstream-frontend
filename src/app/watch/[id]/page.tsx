import { VideoPlayer } from "@/features/video/components/VideoPlayer";
import { VideoMetadata } from "@/features/video/components/VideoMetadata";
import { MOCK_VIDEO_DETAILS } from "@/lib/mock-data";
import { APP_NAME } from "@/lib/constants";

/**
 * Watch Page Component
 * Renders the video player, metadata, and sidebar recommendations.
 * 
 * @param params - Route parameters containing the video ID
 */
export default async function WatchPage({
  // await params is required in Next.js 15
  params, 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  // Mock Data Fetching based on ID
  // In production, fetch(id) would happen here
  const video = { 
      ...MOCK_VIDEO_DETAILS,
      id // Override ID to match param
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
         <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-white/95 px-4 backdrop-blur dark:bg-black/95 dark:border-white/10">
            <div className="font-bold text-lg tracking-tight">{APP_NAME}</div>
        </header>

        <div className="mx-auto max-w-[1800px] p-4 lg:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content (Player + Metadata) */}
                <div className="lg:col-span-2">
                    <VideoPlayer posterUrl={video.posterUrl} videoUrl={video.videoUrl} />
                    <VideoMetadata {...video} />
                </div>

                {/* Sidebar (Recommendations) */}
                <div className="hidden lg:block">
                     <h3 className="mb-4 text-lg font-bold">Up Next</h3>
                     {/* Placeholder for sidebar recommendations */}
                     <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-2">
                                <div className="h-24 w-40 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                                    <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
}
