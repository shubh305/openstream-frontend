import React from 'react';

interface CRTContainerProps {
  children: React.ReactNode;
  isPlaying?: boolean;
}

export const CRTContainer: React.FC<CRTContainerProps> = ({ children, isPlaying = false }) => {
  return (
    <div className="relative w-full aspect-video bg-black border border-noir-border overflow-hidden">
      {/* Corner Brackets (Focus Frame) - Implemented via CSS Gradients */}
      <div className="absolute inset-0 pointer-events-none z-20"
           style={{
             background: `
               linear-gradient(to right, white 2px, transparent 2px) 0 0,
               linear-gradient(to bottom, white 2px, transparent 2px) 0 0,
               linear-gradient(to left, white 2px, transparent 2px) 100% 100%,
               linear-gradient(to top, white 2px, transparent 2px) 100% 100%,
               linear-gradient(to left, white 2px, transparent 2px) 100% 0,
               linear-gradient(to bottom, white 2px, transparent 2px) 100% 0,
               linear-gradient(to right, white 2px, transparent 2px) 0 100%,
               linear-gradient(to top, white 2px, transparent 2px) 0 100%
             `,
             backgroundRepeat: 'no-repeat',
             backgroundSize: '20px 20px'
           }}
      />
      
      {/* CRT Glass Overlay */}
      <div className="crt-glass" />

      {/* Video Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* Standby Overlay (Visible when NOT playing) */}
      {!isPlaying && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90">
             {/* Radar Sweep */}
            <div className="absolute bottom-5 right-5 w-10 h-10 border border-muted-text rounded-full opacity-50">
                <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-conic from-transparent to-white rounded-tl-full origin-top-left animate-spin" />
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="glitch text-4xl md:text-6xl" data-text="SIGNAL LOST">Signal Lost</div>
                <div className="text-muted-text animate-pulse text-sm tracking-widest">
                    WAITING FOR UPLINK...
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
