export default function StudioDashboardLoading() {
  return (
    <div className="flex-1 w-full p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto min-w-0">
      <div className="mb-6 md:mb-10 animate-pulse">
        <div className="h-8 md:h-10 w-48 md:w-64 bg-noir-border rounded-lg mb-2" />
        <div className="h-4 w-32 md:w-48 bg-noir-border rounded" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] 2xl:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6 min-w-0">
          {/* Main Performance Chart Skeleton */}
          <div className="w-full h-auto p-4 md:p-6 bg-noir-terminal/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/5 animate-pulse">
            <div className="h-6 w-48 bg-noir-border rounded mb-6" />
            <div className="h-[200px] sm:h-[250px] md:h-[300px] bg-noir-border/50 rounded-xl" />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Top Content Skeleton */}
            <div className="flex-1 p-4 md:p-6 bg-noir-terminal/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/5 animate-pulse min-w-0">
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 w-32 bg-noir-border rounded" />
                <div className="h-4 w-16 bg-noir-border rounded" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-24 h-16 bg-noir-border rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                       <div className="h-4 w-3/4 bg-noir-border rounded" />
                       <div className="h-3 w-1/2 bg-noir-border rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Skeleton */}
            <div className="flex-1 p-4 md:p-6 bg-noir-terminal/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/5 animate-pulse min-w-0">
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 w-48 bg-noir-border rounded" />
              </div>
              <div className="h-[150px] bg-noir-border/50 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="w-full shrink-0 flex flex-col sm:flex-row xl:flex-col gap-6">
          <div className="flex-1 p-4 md:p-6 bg-noir-terminal/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/5 animate-pulse">
            <div className="h-6 w-32 bg-noir-border rounded mb-6" />
            <div className="flex flex-col items-center py-4 space-y-4">
              <div className="w-24 h-24 rounded-full bg-noir-border" />
              <div className="h-5 w-32 bg-noir-border rounded" />
              <div className="h-8 w-24 bg-noir-border rounded-full" />
            </div>
          </div>
          <div className="flex-1 p-4 md:p-6 bg-noir-terminal/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/5 animate-pulse">
            <div className="h-6 w-48 bg-noir-border rounded mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full bg-noir-border rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
