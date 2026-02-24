export default function PlaylistLoading() {
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen">
      {/* Playlist Sidebar Info Skeleton */}
      <div className="w-full lg:w-96 p-6 shrink-0 lg:fixed lg:h-[calc(100vh-4rem)] border-r border-white/5 z-10">
        <div className="aspect-video w-full bg-noir-border rounded-xl mb-6 animate-pulse" />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="h-8 w-3/4 bg-noir-border rounded-lg animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-noir-border animate-pulse shrink-0" />
        </div>

        <div className="space-y-4 mb-6">
          <div className="h-4 w-1/2 bg-noir-border/80 rounded animate-pulse" />
          <div className="h-3 w-40 bg-noir-border/50 rounded animate-pulse" />
        </div>

        <div className="flex gap-2">
          <div className="h-10 flex-1 bg-noir-border rounded-lg animate-pulse" />
          <div className="h-10 flex-1 bg-noir-border rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Playlist Items Skeleton */}
      <div className="flex-1 lg:ml-96 p-6 space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex gap-4 p-2 rounded-lg border border-transparent">
            <div className="flex items-center justify-center w-8">
              <div className="h-4 w-4 bg-noir-border rounded animate-pulse" />
            </div>

            <div className="w-40 aspect-video bg-noir-border rounded overflow-hidden shrink-0 animate-pulse" />

            <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
              <div className="h-4 w-3/4 max-w-[300px] bg-noir-border rounded animate-pulse" />
              <div className="h-3 w-1/2 max-w-[150px] bg-noir-border/50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
