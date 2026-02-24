export default function AnalyticsLoading() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-10 p-4 md:p-8 min-h-screen">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-noir-border shadow-[0_0_12px_rgba(255,255,255,0.1)] animate-pulse" />
            <div className="h-3 w-32 bg-noir-border/50 rounded animate-pulse" />
          </div>
          <div className="h-12 md:h-20 w-80 max-w-full bg-noir-border rounded-lg animate-pulse" />
          <div className="h-4 md:h-5 w-96 max-w-full bg-noir-border/50 rounded animate-pulse" />
        </div>

        <div className="flex h-12 w-full md:w-64 bg-noir-border rounded-xl animate-pulse shrink-0" />
      </header>

      {/* Stream Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 md:p-8 rounded-3xl bg-noir-terminal/40 border border-white/5 animate-pulse relative overflow-hidden">
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-noir-border rounded" />
                <div className="h-2 w-16 bg-noir-border/50 rounded" />
              </div>
              <div className="h-5 w-12 bg-noir-border rounded-full" />
            </div>
            <div className="mt-auto pt-6 flex flex-col space-y-4">
              <div className="h-10 w-24 bg-noir-border rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8 min-w-0">
          {/* Main Performance Chart Skeleton */}
          <div className="w-full flex flex-col pt-8 pb-4 bg-noir-terminal/40 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] border border-white/5 shadow-2xl animate-pulse relative overflow-hidden">
             <div className="px-8 mb-8 space-y-2">
               <div className="h-4 w-32 bg-noir-border rounded" />
               <div className="h-3 w-48 bg-noir-border/50 rounded" />
             </div>
             <div className="h-[300px] md:h-[400px] bg-noir-border/20 mx-8 rounded-xl" />
          </div>
        </div>

        <div className="space-y-8 w-full">
          {/* Realtime Terminal Skeleton */}
          <div className="p-6 md:p-8 bg-black/60 backdrop-blur-3xl rounded-[32px] border border-white/5 animate-pulse">
            <div className="space-y-2 mb-8 border-b border-white/5 pb-6">
              <div className="h-4 w-24 bg-noir-border rounded" />
              <div className="h-3 w-32 bg-noir-border/50 rounded" />
            </div>

            <div className="space-y-6 flex flex-col items-center">
               <div className="w-48 h-48 rounded-full border-4 border-noir-border/50 flex flex-col items-center justify-center space-y-2">
                 <div className="h-8 w-16 bg-noir-border rounded" />
               </div>
            </div>
          </div>
          
          {/* Top Content Skeleton */}
          <div className="p-6 md:p-8 bg-noir-terminal/40 backdrop-blur-3xl rounded-[32px] border border-white/5 animate-pulse">
            <div className="space-y-2 mb-8 border-b border-white/5 pb-6">
              <div className="h-4 w-32 bg-noir-border rounded" />
              <div className="h-3 w-48 bg-noir-border/50 rounded" />
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-24 h-14 bg-noir-border rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-full bg-noir-border rounded" />
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-noir-border/50 rounded" />
                      <div className="h-3 w-12 bg-noir-border/50 rounded" />
                    </div>
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
