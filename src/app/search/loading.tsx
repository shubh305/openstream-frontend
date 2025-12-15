import { Loader2 } from "lucide-react";

export default function SearchLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-noir-border rounded" />
          <div className="h-4 w-32 bg-noir-border/60 rounded" />
        </div>

        {/* Results skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-2">
              <div className="w-64 min-w-[16rem] aspect-video bg-noir-border rounded-lg" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-5 w-3/4 bg-noir-border rounded" />
                <div className="h-4 w-1/2 bg-noir-border/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <Loader2 className="w-8 h-8 text-electric-lime animate-spin" />
      </div>
    </div>
  );
}
