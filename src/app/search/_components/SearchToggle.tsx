"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Search } from "lucide-react";

export function SearchToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAI = searchParams.get("ai") === "true";

  const toggleSearch = (aiMode: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (aiMode) {
      params.set("ai", "true");
    } else {
      params.delete("ai");
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex bg-noir-bg p-1 rounded-lg border border-noir-border w-fit">
      <Button
        variant={!isAI ? "default" : "ghost"}
        size="sm"
        onClick={() => toggleSearch(false)}
        className={`gap-2 h-8 cursor-pointer ${!isAI ? "bg-noir-terminal text-electric-lime" : "text-muted-text"}`}
      >
        <Search className="w-3.5 h-3.5" />
        Standard
      </Button>
      <Button
        variant={isAI ? "default" : "ghost"}
        size="sm"
        onClick={() => toggleSearch(true)}
        className={`gap-2 h-8 cursor-pointer ${isAI ? "bg-noir-terminal text-electric-lime" : "text-muted-text"}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI Search
      </Button>
    </div>
  );
}
