"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-signal-red/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-signal-red" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Search Failed</h1>
        <p className="text-muted-text mb-6 max-w-md">
          {error.message || "Something went wrong while searching. Please try again."}
        </p>
        <Button
          onClick={reset}
          variant="outline"
          className="gap-2 border-noir-border hover:border-electric-lime"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
