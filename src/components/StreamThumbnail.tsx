"use client";

import Image from "next/image";

interface StreamThumbnailProps {
  url: string | null | undefined;
  title: string;
  className?: string;
  avatarUrl?: string;
  avatarFallback?: string; // single letter / initials
}

export function StreamThumbnail({ url, title, className = "", avatarUrl, avatarFallback }: StreamThumbnailProps) {
  const isValidUrl = url && url !== "" && url !== "/placeholder.jpg";

  if (isValidUrl) {
    return (
      <div className={`relative w-full h-full bg-noir-terminal ${className}`}>
        <Image src={url!} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
      </div>
    );
  }

  // Generate a deterministic dark gradient based on title length
  const gradients = ["from-zinc-900 to-black", "from-neutral-900 to-black", "from-stone-900 to-black", "from-slate-900 to-black"];
  const gradientIndex = title.length % gradients.length;
  const gradient = gradients[gradientIndex];

  const fallbackLetter = avatarFallback || (title[0] || "?").toUpperCase();

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3 overflow-hidden group-hover:scale-105 transition-transform duration-700 ${className}`}
    >
      {/* Avatar placeholder */}
      <div className="relative w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden shadow-lg bg-black/40 shrink-0">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={fallbackLetter} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">{fallbackLetter}</div>
        )}
      </div>
      {/* Title */}
      <p className="text-white/70 text-xs font-medium text-center line-clamp-1 px-4 max-w-[80%]">{title || "Untitled"}</p>
    </div>
  );
}

