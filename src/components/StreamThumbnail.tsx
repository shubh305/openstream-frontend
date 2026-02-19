"use client";

import Image from "next/image";

interface StreamThumbnailProps {
  url: string | null | undefined;
  title: string;
  className?: string;
}

export function StreamThumbnail({ url, title, className = "" }: StreamThumbnailProps) {
  const isValidUrl = url && url !== "" && url !== "/placeholder.jpg";

  if (isValidUrl) {
    return (
      <div className={`relative w-full h-full bg-noir-terminal ${className}`}>
        <Image
          src={url!}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  // Generate a deterministic gradient based on title length
  const gradients = [
    "from-purple-900/80 to-blue-900/80",
    "from-emerald-900/80 to-teal-900/80",
    "from-orange-900/80 to-red-900/80",
    "from-pink-900/80 to-rose-900/80",
  ];
  const gradientIndex = title.length % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center p-4 overflow-hidden group-hover:scale-105 transition-transform duration-700 ${className}`}>
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 hidden"></div>
      <div className="text-center z-10 w-full max-w-[80%]">
        <h3 className="text-white/90 font-bold text-lg md:text-xl tracking-tight line-clamp-2 uppercase drop-shadow-lg">
          {title || "Untitled Stream"}
        </h3>
        <div className="mt-2 flex justify-center">
            <div className="h-1 w-12 bg-white/20 rounded-full group-hover:w-20 transition-all duration-500"></div>
        </div>
      </div>
    </div>
  );
}
