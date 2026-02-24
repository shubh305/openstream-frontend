export default function SubscriptionsLoading() {
  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-noir-border rounded-lg animate-pulse" />
        <div className="h-4 w-24 bg-noir-border/50 rounded animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-noir-terminal rounded-xl p-6 flex flex-col items-center text-center border border-white/5 animate-pulse">
            <div className="mb-4">
              <div className="w-20 h-20 rounded-full bg-noir-border relative overflow-hidden" />
            </div>
            <div className="h-5 w-32 bg-noir-border rounded mb-2" />
            <div className="h-3 w-24 bg-noir-border/50 rounded mb-4" />
            
            <div className="h-10 w-32 bg-noir-border rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
