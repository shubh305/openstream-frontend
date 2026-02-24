export default function LiveLoading() {
  return (
    <div className="container mx-auto p-6 lg:p-10 space-y-8 min-h-screen">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 bg-noir-border rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-noir-border/50 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-video bg-noir-border rounded-xl animate-pulse relative">
               <div className="absolute top-2 left-2 w-12 h-5 bg-noir-border/80 rounded animate-pulse" />
            </div>
            <div className="space-y-2 pt-2 flex gap-3">
               <div className="w-10 h-10 rounded-full bg-noir-border animate-pulse shrink-0" />
               <div className="flex-1 space-y-2">
                 <div className="h-4 w-3/4 bg-noir-border rounded animate-pulse" />
                 <div className="h-3 w-1/2 bg-noir-border rounded animate-pulse" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
