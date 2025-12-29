import { Loader2 } from "lucide-react";

export default function HomeLoading() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8">
        {/* Featured section skeleton */}
        <div className="aspect-video max-h-[500px] bg-noir-border rounded-xl" />

        {/* Video grid skeleton */}
        <div className="space-y-6">
          <div className="h-6 w-48 bg-noir-border rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-video bg-noir-border rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-noir-border/60 rounded" />
                  <div className="h-3 w-1/2 bg-noir-border/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <Loader2 className="w-8 h-8 text-electric-lime animate-spin" />
      </div>
    </div>
  );
}
