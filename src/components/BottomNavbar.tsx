"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Tv, Sparkles, X, User as UserIcon, Settings, Upload, LogOut, Bell, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getSuggestions } from "@/actions/search";
import { Input } from "./ui/input";
import { User } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/actions/auth";
import Image from "next/image";

interface BottomNavbarProps {
  user?: User | null;
}

export function BottomNavbar({ user }: BottomNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const isAnyOverlayOpen = isSearchOpen || isAccountOpen;
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("openstream_recent_searches");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => setRecentSearches(parsed), 0);
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  useEffect(() => {
    // Close overlays when pathname changes
    setIsSearchOpen(false);
    setIsAccountOpen(false);
  }, [pathname]);

  const handleSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    localStorage.setItem("openstream_recent_searches", JSON.stringify(updated));
    
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (timeoutId) clearTimeout(timeoutId);

    if (val.trim().length > 1) {
      const id = setTimeout(async () => {
        const results = await getSuggestions(val);
        setSuggestions(results.slice(0, 5));
      }, 300);
      setTimeoutId(id);
    } else {
      setSuggestions([]);
    }
  };

  const handleLogout = () => {
    import("react").then(({ startTransition }) => {
      startTransition(() => {
        logout();
        setIsAccountOpen(false);
      });
    });
  };

  const NAV_ITEMS = [
    { 
      icon: Home, 
      label: "Home", 
      href: "/", 
      onClick: () => { setIsSearchOpen(false); setIsAccountOpen(false); },
      active: pathname === "/" && !isAnyOverlayOpen
    },
    { 
      icon: Tv, 
      label: "Following", 
      href: "/subscriptions", 
      onClick: () => { setIsSearchOpen(false); setIsAccountOpen(false); },
      active: pathname === "/subscriptions" && !isAnyOverlayOpen
    },
    { 
      icon: Search, 
      label: "Search", 
      onClick: () => {
        setIsAccountOpen(false);
        setIsSearchOpen(!isSearchOpen);
      },
      active: isSearchOpen || (pathname.startsWith("/search") && !isAccountOpen)
    },
    { 
      icon: Sparkles, 
      label: "Clips", 
      href: "/clips", 
      onClick: () => { setIsSearchOpen(false); setIsAccountOpen(false); },
      active: pathname.startsWith("/clips") && !isAnyOverlayOpen
    },
    { 
      label: "Account", 
      onClick: () => {
        setIsSearchOpen(false);
        setIsAccountOpen(!isAccountOpen);
      },
      active: isAccountOpen || (!isSearchOpen && (pathname.startsWith("/@") || pathname.startsWith("/studio") || pathname === "/upload")),
      isAvatar: true
    },
  ];

  return (
    <>
      {/* Search Overlay - Full Screen "Native" Experience */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[160] bg-black/95 flex flex-col pt-safe px-4">
          <div className="flex items-center gap-4 py-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-text group-focus-within:text-electric-lime transition-colors" />
              <Input
                autoFocus
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={onSearchChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                className="w-full bg-white/5 border-white/10 focus:border-electric-lime pl-12 h-14 text-lg rounded-2xl transition-all"
              />
            </div>
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-8">
            {searchQuery.trim() === "" && recentSearches.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase px-2">Recently Searched</h3>
                <div className="space-y-1">
                  {recentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(item)}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-text group-hover:text-white">
                        <Search className="w-4 h-4" />
                      </div>
                      <span className="text-white font-bold">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.trim() !== "" && suggestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase px-2">Suggestions</h3>
                <div className="space-y-1">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(item)}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-text group-hover:text-white">
                        <Search className="w-4 h-4" />
                      </div>
                      <span className="text-white font-bold">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Drawer - Native Experience */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-[150] bg-black/90 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto pt-16 px-6 pb-24 space-y-10">
            {/* User Profile Header */}
            {user ? (
               <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative w-24 h-24 rounded-3xl overflow-hidden glass-border border-2 border-white/10 shadow-2xl">
                    <Avatar className="w-full h-full rounded-none grayscale">
                      <AvatarImage src={user.avatarUrl} alt={user.username} className="object-cover" />
                      <AvatarFallback className="text-3xl font-black bg-noir-terminal text-white">{user.username[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">{user.username}</h2>
                    <p className="text-sm text-muted-text font-medium">{user.email}</p>
                  </div>
               </div>
            ) : (
                <div className="flex flex-col items-center text-center space-y-6 pt-10">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-muted-text" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Guest Mode</h2>
                        <p className="text-sm text-muted-text">Login to follow creators and share clips.</p>
                    </div>
                    <div className="flex flex-col w-full gap-3 px-4">
                        <Link href="/login" onClick={() => setIsAccountOpen(false)} className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] text-center cursor-pointer">Login</Link>
                        <Link href="/signup" onClick={() => setIsAccountOpen(false)} className="w-full py-4 rounded-2xl bg-white/5 text-white font-black text-xs uppercase tracking-[0.2em] text-center border border-white/10 cursor-pointer">Sign Up</Link>
                    </div>
                </div>
            )}

            {/* Menu Items */}
            {user && (
              <div className="space-y-2">
                 <h3 className="text-[10px] font-black text-white/20 tracking-[0.3em] uppercase px-4 mb-4">Channel & Tools</h3>
                 <div className="grid grid-cols-1 gap-2">
                    <Link 
                        href="/studio/content" 
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center justify-between p-5 rounded-3xl glasswork border border-white/5 active:bg-white/10 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-electric-lime/10 flex items-center justify-center text-electric-lime">
                                <Video className="w-5 h-5" />
                            </div>
                            <span className="text-base font-bold text-white">Content</span>
                        </div>
                    </Link>

                    <Link 
                        href={`/@${user.username}`} 
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center justify-between p-5 rounded-3xl glasswork border border-white/5 active:bg-white/10 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-electric-lime/10 flex items-center justify-center text-electric-lime">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <span className="text-base font-bold text-white">Your Channel</span>
                        </div>
                    </Link>

                    <Link 
                        href="/studio/customization" 
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center justify-between p-5 rounded-3xl glasswork border border-white/5 active:bg-white/10 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-text">
                                <Settings className="w-5 h-5" />
                            </div>
                            <span className="text-base font-bold text-white">Settings</span>
                        </div>
                    </Link>

                    <button 
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center justify-between p-5 rounded-3xl glasswork border border-white/5 active:bg-white/10 transition-colors text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-text relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-signal-red rounded-full" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base font-bold text-white">Notifications</span>
                                <span className="text-[10px] text-muted-text uppercase font-black tracking-tight">4 New Alerts</span>
                            </div>
                        </div>
                    </button>

                    <Link 
                        href="/upload" 
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center justify-between p-5 rounded-3xl glasswork border border-white/5 active:bg-white/10 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-text">
                                <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-base font-bold text-white">Upload</span>
                        </div>
                    </Link>

                    <button 
                        onClick={handleLogout}
                        className="flex items-center justify-between p-5 rounded-3xl glasswork border border-signal-red/10 active:bg-signal-red/10 group mt-4 cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-signal-red/10 flex items-center justify-center text-signal-red">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <span className="text-base font-bold text-signal-red group-active:text-white transition-colors">Terminate Session</span>
                        </div>
                    </button>
                 </div>
              </div>
            )}
          </div>
          <button 
                onClick={() => setIsAccountOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white z-[170] cursor-pointer"
            >
                <X className="w-6 h-6" />
          </button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-[200] md:hidden">
        {/* Safe Area Gradient */}
        <div className="absolute inset-0 -top-10 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
        
        {/* Premium Glass Container */}
        <div className="mx-2 mb-4 h-16 glasswork glass-border border-white/10 rounded-2xl flex items-center justify-around px-2 shadow-2xl shadow-black/50 relative">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = item.active;
            const Icon = item.icon;

            const content = (
              <div 
                className={cn(
                  "p-2 rounded-xl transition-all duration-300 flex flex-col items-center",
                  isActive 
                    ? "bg-white/10 text-white translate-y-[-4px]" 
                    : "text-muted-text hover:text-white"
                )}
              >
                {item.isAvatar && user ? (
                    <div className={cn(
                        "w-7 h-7 rounded-sm overflow-hidden border border-white/10 transition-all",
                        isActive && "border-white ring-2 ring-white/20"
                    )}>
                        <Image src={user.avatarUrl || ""} alt={user.username} width={28} height={28} className="object-cover h-full grayscale" />
                    </div>
                ) : Icon ? (
                    <Icon 
                        className={cn(
                            "w-6 h-6",
                            isActive && "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                        )} 
                    />
                ) : null}
                
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest mt-0.5 transition-all duration-300",
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none absolute"
                )}>
                  {item.label}
                </span>
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={item.onClick}
                  className="relative flex flex-col items-center justify-center py-1 transition-all duration-300 active:scale-90 cursor-pointer"
                >
                  {content}
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-electric-lime shadow-[0_0_8px_rgba(180,255,0,0.8)]" />
                  )}
                </Link>
              );
            }

            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="relative flex flex-col items-center justify-center py-1 transition-all duration-300 active:scale-90 cursor-pointer"
              >
                {content}
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-electric-lime shadow-[0_0_8px_rgba(180,255,0,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
