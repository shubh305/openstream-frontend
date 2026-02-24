export default function LibraryLoading() {
  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-noir-border rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-noir-border/50 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-noir-border rounded-full animate-pulse" />
      </header>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="p-6 rounded-3xl bg-noir-terminal border border-white/5 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-noir-border mb-4" />
            <div className="h-5 w-24 bg-noir-border rounded mb-2" />
            <div className="h-3 w-20 bg-noir-border/50 rounded" />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-noir-border/50 rounded animate-pulse" />
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video relative rounded-2xl overflow-hidden bg-noir-border animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-3/4 bg-noir-border rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-noir-border rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
