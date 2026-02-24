export default function ChannelLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background elements */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#1a1a1a] to-transparent -z-10 pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />

      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 flex gap-10">
        {/* Left Sidebar Skeleton (Desktop) */}
        <aside className="hidden lg:block w-80 shrink-0 space-y-6 sticky top-24 h-fit">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl animate-pulse">
            <div className="w-32 h-32 rounded-full border-4 border-[#050505] bg-noir-border mb-4" />
            
            <div className="h-6 w-48 bg-noir-border rounded mb-2" />
            <div className="h-4 w-32 bg-noir-border/50 rounded mb-6" />

            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
                <div className="h-6 w-12 bg-noir-border rounded" />
                <div className="h-3 w-20 bg-noir-border/50 rounded" />
              </div>
              <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
                <div className="h-6 w-12 bg-noir-border rounded" />
                <div className="h-3 w-16 bg-noir-border/50 rounded" />
              </div>
            </div>

            <div className="w-full h-10 bg-noir-border rounded-full" />
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 animate-pulse">
            <div className="h-4 w-16 bg-noir-border/60 mb-4 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-noir-border/50 rounded" />
              <div className="h-3 w-5/6 bg-noir-border/50 rounded" />
              <div className="h-3 w-4/6 bg-noir-border/50 rounded" />
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex gap-2">
               <div className="w-8 h-8 rounded-full bg-noir-border" />
               <div className="w-8 h-8 rounded-full bg-noir-border" />
            </div>
          </div>
        </aside>

        {/* Main Content Area Skeleton */}
        <main className="flex-1 min-w-0">
          {/* Mobile Header Skeleton */}
          <div className="lg:hidden mb-8 flex items-center gap-4 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-noir-border shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 bg-noir-border rounded" />
              <div className="h-4 w-64 bg-noir-border/50 rounded" />
            </div>
          </div>

          {/* Pill Navigation Skeleton */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar pb-2 animate-pulse">
             <div className="h-10 w-24 bg-white/10 rounded-full" />
             <div className="h-10 w-20 bg-white/5 rounded-full" />
             <div className="h-10 w-28 bg-white/5 rounded-full" />
             <div className="h-10 w-20 bg-white/5 rounded-full" />
          </div>

          {/* Videos Grid Skeleton */}
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-noir-border/50 rounded-full" />
                  <div className="h-5 w-32 bg-noir-border rounded" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="group relative bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden animate-pulse">
                    <div className="aspect-video relative bg-noir-border" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 w-full bg-noir-border rounded" />
                      <div className="h-4 w-2/3 bg-noir-border rounded" />
                      <div className="pt-2 flex items-center justify-between">
                        <div className="h-3 w-24 bg-noir-border/50 rounded" />
                        <div className="h-6 w-6 rounded-full bg-noir-border/50" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
