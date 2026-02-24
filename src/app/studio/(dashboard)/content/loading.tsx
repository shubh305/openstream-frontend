export default function ContentLoading() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-noir-border animate-pulse" />
            <div className="h-3 w-32 bg-noir-border rounded animate-pulse" />
          </div>
          <div className="h-10 w-64 bg-noir-border rounded-lg animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-noir-border/50 rounded animate-pulse" />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-14 md:h-10 w-full sm:w-64 bg-noir-border rounded-2xl md:rounded-xl animate-pulse" />
          <div className="h-14 md:h-10 w-full sm:w-40 bg-noir-border rounded-[24px] md:rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="group relative rounded-2xl md:rounded-[32px] overflow-hidden bg-noir-border/50 border border-white/5 animate-pulse">
            <div className="w-full aspect-[4/3] bg-noir-border relative" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 md:p-6 flex flex-col justify-end">
              <div className="h-5 w-3/4 bg-noir-border/80 rounded mb-2" />
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-noir-border/80 rounded" />
                  <div className="h-3 w-16 bg-noir-border/80 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
