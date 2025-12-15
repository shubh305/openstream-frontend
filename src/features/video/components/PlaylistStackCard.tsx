"use client";

import { Play } from "lucide-react";

interface PlaylistStackCardProps {
  title: string;
  lessonCount: number;
  author: string;
  thumbnail: string;
  color?: string;
}

export function PlaylistStackCard({ 
  title, 
  lessonCount, 
  author, 
  thumbnail, 
  color = "#121212" 
}: PlaylistStackCardProps) {
  return (
    <div className="group relative w-full aspect-[16/9] cursor-pointer perspective-1000">
      
      {/* Bottom Card Layer (Stack 2) */}
      <div 
        className="absolute inset-0 top-3 left-0 w-[96%] mx-auto bg-noir-terminal border border-noir-border/50 rounded-xl rounded-b-none translate-y-2 opacity-60 z-0 transition-transform duration-300 group-hover:translate-y-3 group-hover:scale-95"
      />
      
      {/* Middle Card Layer (Stack 1) */}
      <div 
        className="absolute inset-0 top-1.5 left-0 w-[98%] mx-auto bg-noir-terminal border border-noir-border/80 rounded-xl rounded-b-none translate-y-1 opacity-80 z-10 transition-transform duration-300 group-hover:translate-y-1.5 group-hover:scale-[0.98]"
      />

      {/* Main Card (Top) */}
      <div 
        className="absolute inset-0 z-20 bg-noir-terminal border border-noir-border rounded-xl overlow-hidden flex flex-col justify-between overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 shadow-2xl"
        style={{
            background: `linear-gradient(to bottom right, ${color}20, ${color}05, #000)`
        }}
      >
        {/* Background Overlay/Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-opacity group-hover:opacity-60" style={{ backgroundImage: `url(${thumbnail})` }} />
        
        {/* Content */}
        <div className="relative z-30 p-5 h-full flex flex-col justify-between">
           {/* Header / Pill */}
           <div className="flex justify-between items-start">
              <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/80">
                 {lessonCount} videos
              </div>
           </div>

           {/* Title Section */}
           <div>
               <h3 className="text-xl font-bold text-white leading-tight mb-2 drop-shadow-md group-hover:text-electric-lime transition-colors">
                   {title}
               </h3>
               
               <div className="flex items-center gap-2 mt-3">
                   <div className="w-5 h-5 rounded-full bg-electric-lime/20 flex items-center justify-center text-[10px] font-bold text-electric-lime border border-electric-lime/40">
                       {author[0]}
                   </div>
                   <span className="text-xs text-white/60 font-medium">{author}</span>
               </div>
           </div>
           
           {/* Hover Play Button Overlay */}
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-electric-lime flex items-center justify-center shadow-[0_0_20px_rgba(209,255,0,0.4)] transform scale-50 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 text-black fill-black ml-1" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
