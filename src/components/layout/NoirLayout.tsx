import React from 'react';

interface NoirLayoutProps {
  children: React.ReactNode;
}

export const NoirLayout: React.FC<NoirLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-noir-bg text-foreground overflow-hidden font-mono flex flex-col">
      {/* Visual Effects */}
      <div className="scanline-overlay" />
      <div className="scanline-bar" />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 p-4 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col">
        {children}
      </main>

      {/* Sherpa Metadata Footer */}
      <footer className="relative z-10 border-t border-noir-border bg-noir-terminal p-2 text-xs text-muted-text flex justify-between items-center px-4 uppercase tracking-widest">
        <div>
          <span>System: </span><span className="text-electric-lime">ONLINE</span>
        </div>
        <div className="flex gap-8">
            <span>Rgn: <span className="text-white">US-EAST</span></span>
            <span>Up: <span className="text-white">99.9%</span></span>
            <span>Elv: <span className="text-white">5200m</span></span>
        </div>
      </footer>
    </div>
  );
};
