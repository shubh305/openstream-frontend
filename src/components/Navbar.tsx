"use client";

import { usePathname } from "next/navigation";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, LogOut, Menu, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/actions/auth";
import { useSidebar } from "@/lib/sidebar-context";
import { cn } from "@/lib/utils";

interface User {
    username: string;
    email: string;
    avatarUrl?: string;
}

interface NavbarProps {
    user?: User; 
}

const NotificationItem = ({ title, desc, time, type }: { title: string; desc: string; time: string; type: "success" | "warn" | "info" }) => (
  <div className="p-3 hover:bg-noir-border/30 transition-colors cursor-default group rounded-lg mx-2 my-1">
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${type === "success" ? "bg-electric-lime" : type === "warn" ? "bg-signal-red" : "bg-white/60"}`} />
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <span className="text-xs text-muted-text">{time}</span>
    </div>
    <p className="text-xs text-muted-text leading-relaxed pl-4 group-hover:text-white/70 transition-colors">{desc}</p>
  </div>
);

import { getSuggestions } from "@/actions/search";

function SearchForm({ isMobile, onClose }: { isMobile?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("openstream_recent_searches", JSON.stringify(updated));
  };

  const handleSearch = (term: string) => {
    if (term.trim()) {
      setShowSuggestions(false);
      setQuery(term);
      saveRecentSearch(term);
      router.push(`/search?q=${encodeURIComponent(term.trim())}`);
      if (onClose) onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (timeoutId) clearTimeout(timeoutId);

    if (val.trim().length > 1) {
      const id = setTimeout(async () => {
        const results = await getSuggestions(val);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      }, 300);
      setTimeoutId(id);
    } else {
      setSuggestions([]);
      if (val.trim() === "") {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${isMobile ? "flex w-full" : "hidden md:flex flex-1 max-w-md"} relative mx-auto`}>
      <div className="relative w-full group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text group-focus-within:text-electric-lime transition-colors" />
        <Input
          type="search"
          placeholder="Search..."
          value={query}
          onChange={handleChange}
          autoFocus={isMobile}
          onFocus={() => {
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          className="w-full bg-noir-bg border-noir-border focus:border-electric-lime pl-10 h-10 text-sm rounded-lg transition-all"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || (query.trim() === "" && recentSearches.length > 0)) && (
        <div className="absolute top-12 left-0 right-0 bg-noir-terminal border border-noir-border rounded-lg shadow-xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          {query.trim() === "" && recentSearches.length > 0 && (
            <div className="px-4 py-2 text-[10px] font-bold text-muted-text uppercase tracking-wider border-b border-noir-border/50">Recent Searches</div>
          )}
          {(query.trim() === "" ? recentSearches : suggestions).map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
              onClick={() => handleSearch(item)}
            >
              <Search className="w-3 h-3 text-muted-text" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}



export function Navbar({ user }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toggle } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/forgot-password");

  const isStudioPage = pathname?.startsWith("/studio");

  if (isAuthPage) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-[60] flex h-16 items-center justify-between px-4 md:px-8 transition-all duration-500 overflow-visible",
        scrolled ? "mx-0 md:mx-4 mt-0 md:mt-2 h-14 bg-noir-terminal md:rounded-xl border border-white/10" : "bg-transparent border-b border-noir-border",
      )}
    >
      <div className={`flex items-center gap-4 transition-all duration-300 ${isSearchOpen ? "w-0 opacity-0 -translate-x-10 pointer-events-none" : "w-auto opacity-100 translate-x-0"}`}>
        {!isStudioPage && (
          <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-noir-border cursor-pointer flex md:hidden" onClick={toggle}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Link href="/" className="flex items-center gap-3 group shrink-0 active:scale-95 transition-transform touch-none">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-noir-border glass-border group-hover:border-white transition-all duration-300">
            <Image src="/logo.svg" alt="OpenStream" fill className="object-contain p-1.5" sizes="36px" priority />
          </div>
          <span className="hidden text-base font-bold tracking-tight text-white lg:block group-hover:text-white/80 transition-colors uppercase">OpenStream</span>
        </Link>
      </div>

      <div className={`flex-1 flex items-center transition-all duration-300 ${isSearchOpen ? "max-w-full px-0" : "max-w-md px-4 md:px-8"}`}>
        {isSearchOpen ? (
          <div className="flex items-center gap-2 w-full animate-in slide-in-from-right-4 duration-300">
            <SearchForm isMobile onClose={() => setIsSearchOpen(false)} />
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)} className="text-muted-text hover:text-white shrink-0">
              Cancel
            </Button>
          </div>
        ) : (
          <SearchForm />
        )}
      </div>

      <div
        className={`flex items-center gap-2 sm:gap-4 shrink-0 relative z-[70] transition-all duration-300 ${isSearchOpen ? "w-0 opacity-0 translate-x-10 pointer-events-none" : "w-auto opacity-100 translate-x-0"}`}
      >
        {mounted && user ? (
          <>
            <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex text-muted-text hover:text-white hover:bg-noir-border rounded-lg cursor-pointer">
              <Link href="/upload">
                <Upload className="h-5 w-5" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex text-muted-text hover:text-white hover:bg-noir-border relative group rounded-lg cursor-pointer">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-signal-red rounded-full group-hover:scale-125 transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-noir-deep border border-noir-border glasswork rounded-xl p-0 shadow-2xl" align="end">
                <DropdownMenuLabel className="p-4 border-b border-white/5 flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-[10px] text-muted-text bg-white/5 px-2 py-0.5 rounded-full border border-white/5">4 NEW</span>
                </DropdownMenuLabel>
                <div className="max-h-72 overflow-y-auto py-1">
                  <NotificationItem title="Stream Online" desc="Your broadcast is now live and visible to viewers." time="2m" type="success" />
                  <NotificationItem title="New Login" desc="Session verified from new device." time="15m" type="info" />
                  <NotificationItem title="Storage Warning" desc="You're approaching your storage limit (85%)." time="1h" type="warn" />
                  <NotificationItem title="Update Applied" desc="Latest platform updates have been deployed." time="3h" type="info" />
                </div>
                <div className="p-3 border-t border-white/5 text-center">
                  <button className="text-[10px] text-muted-text hover:text-white transition-colors tracking-widest font-bold">CLEAR ALL</button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden md:flex relative h-9 w-9 p-0 border border-noir-border glass-border hover:border-white transition-all overflow-hidden rounded-lg cursor-pointer"
                >
                  <Avatar className="h-9 w-9 rounded-lg border-none grayscale">
                    <AvatarImage src={user.avatarUrl} alt={user.username} className="object-cover" />
                    <AvatarFallback className="bg-noir-terminal text-white rounded-none">{user.username[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-noir-deep border border-noir-border glasswork rounded-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-mono p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-white">{user.username}</p>
                    <p className="text-[10px] leading-none text-muted-text mt-1">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 cursor-pointer m-1 rounded-lg">
                  <Link href={`/@${user.username}`} className="w-full text-sm font-medium py-2">
                    Your Channel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 cursor-pointer m-1 rounded-lg">
                  <Link href="/studio/customization" className="w-full text-sm font-medium py-2">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  className="text-signal-red hover:bg-white/5 focus:bg-white/5 cursor-pointer text-sm font-medium py-2 m-1 rounded-lg"
                  onClick={() => {
                    import("react").then(({ startTransition }) => {
                      startTransition(() => logout());
                    });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : mounted ? (
          <div className="flex items-center gap-3 relative z-50 pointer-events-auto">
            <Link href="/login" className="text-xs font-bold hover:text-white text-muted-text uppercase tracking-widest transition-colors cursor-pointer px-2 sm:px-3">
              Login
            </Link>
            <Button
              size="sm"
              asChild
              className="bg-white text-black hover:bg-white/90 transition-colors text-xs font-bold px-4 sm:px-6 rounded-full cursor-pointer h-8 sm:h-9 uppercase tracking-widest"
            >
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 h-10 w-24" />
        )}
      </div>
    </header>
  );
}
