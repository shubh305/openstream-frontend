export default function WatchLoading() {
  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-[1800px] mx-auto p-0 sm:p-4 lg:p-6 flex flex-col xl:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Video Player Skeleton */}
          <div className="relative aspect-video w-full bg-noir-border sm:rounded-2xl overflow-hidden animate-pulse" />

          {/* Video Info Skeleton */}
          <div className="px-4 py-4 sm:px-0 mt-4 space-y-4">
            <div className="h-8 w-3/4 bg-noir-border rounded-lg animate-pulse" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-noir-border rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-noir-border rounded animate-pulse" />
                  <div className="h-4 w-24 bg-noir-border rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-24 bg-noir-border rounded-full animate-pulse" />
                <div className="h-10 w-32 bg-noir-border rounded-full animate-pulse" />
              </div>
            </div>
            {/* Description Box Skeleton */}
            <div className="p-4 bg-noir-border rounded-xl space-y-2 animate-pulse">
              <div className="h-4 w-1/4 bg-noir-border/60 rounded" />
              <div className="h-4 w-full bg-noir-border/60 rounded" />
              <div className="h-4 w-2/3 bg-noir-border/60 rounded" />
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="w-full xl:w-[400px] shrink-0 px-4 sm:px-0">
          <div className="h-6 w-32 bg-noir-border rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex gap-2">
                <div className="w-[160px] aspect-video bg-noir-border rounded-lg animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-full bg-noir-border rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-noir-border rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-noir-border rounded animate-pulse mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
