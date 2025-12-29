"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-background text-foreground">
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-signal-red/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-signal-red" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Something went wrong!</h1>
            <p className="text-muted-text mb-8">
              {error.message || "An unexpected error occurred. Our team has been notified."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={reset}
                variant="outline"
                className="gap-2 border-noir-border hover:border-electric-lime"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button asChild className="gap-2 bg-electric-lime text-black hover:bg-electric-lime/80">
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
