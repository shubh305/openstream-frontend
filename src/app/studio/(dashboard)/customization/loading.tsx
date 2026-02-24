export default function CustomizationLoading() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-10 p-4 md:p-8 pb-32 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-noir-border/80 animate-pulse" />
            <div className="h-3 w-40 bg-noir-border/50 rounded animate-pulse" />
          </div>
          <div className="h-12 md:h-16 w-80 max-w-full bg-noir-border rounded-lg animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-noir-border/50 rounded animate-pulse" />
        </div>
        
        <div className="h-12 w-32 bg-noir-border rounded-xl animate-pulse" />
      </header>

      <div className="space-y-8">
        {/* Banner Section Skeleton */}
        <div className="p-8 rounded-[32px] bg-noir-terminal/40 border border-white/5 animate-pulse">
          <div className="space-y-4 mb-8">
            <div className="h-6 w-32 bg-noir-border rounded" />
            <div className="h-4 w-96 max-w-full bg-noir-border/50 rounded" />
          </div>
          
          <div className="w-full aspect-[4/1] bg-noir-border rounded-2xl" />
        </div>

        {/* Profile Info Section Skeleton */}
        <div className="p-8 rounded-[32px] bg-noir-terminal/40 border border-white/5 animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Skeleton */}
            <div className="shrink-0 flex flex-col gap-4">
              <div className="h-6 w-24 bg-noir-border rounded" />
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-noir-border" />
            </div>

            {/* Form Fields Skeleton */}
            <div className="flex-1 space-y-8 max-w-2xl">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-noir-border rounded" />
                <div className="h-12 w-full bg-noir-border rounded-xl" />
                <div className="h-4 w-48 bg-noir-border/50 rounded" />
              </div>
              
              <div className="space-y-4">
                <div className="h-6 w-32 bg-noir-border rounded" />
                <div className="h-12 w-full bg-noir-border rounded-xl" />
              </div>
              
              <div className="space-y-4">
                <div className="h-6 w-32 bg-noir-border rounded" />
                <div className="h-32 w-full bg-noir-border rounded-xl" />
                <div className="h-4 w-64 bg-noir-border/50 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
