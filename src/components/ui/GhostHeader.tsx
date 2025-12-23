import Link from 'next/link';

export const GhostHeader = () => {
  return (
    <header className="w-full bg-transparent border-b border-noir-border py-4 mb-8">
      <div className="flex justify-between items-center">
        {/* Brand */}
        <Link href="/" className="group">
          <h1 className="text-2xl tracking-[0.5em] text-white group-hover:text-electric-lime transition-colors duration-200">
            OPEN<span className="font-light">STREAM</span>
          </h1>
          <div className="text-[10px] tracking-[0.3em] text-muted-text mt-1">
            NETWORK // <span className="animate-blink text-electric-lime">ONLINE</span>
          </div>
        </Link>
      </div>
    </header>
  );
};
