"use client";

import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";
import { Loader2, Mail, Lock, User } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const result = await signup(data);

    if (result?.error) {
      setError(result.error);
      toast.error("Signup failed", {
        description: result.error,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 relative z-10">
      {/* Circuit decoration elements */}
      <div className="absolute top-20 left-20 w-16 h-8 border border-noir-border rounded-sm opacity-30 hidden lg:block" />
      <div className="absolute top-20 right-20 w-16 h-8 border border-noir-border rounded-sm opacity-30 hidden lg:block" />
      <div className="absolute bottom-20 left-20 w-16 h-8 border border-noir-border rounded-sm opacity-30 hidden lg:block" />
      <div className="absolute bottom-20 right-20 w-16 h-8 border border-noir-border rounded-sm opacity-30 hidden lg:block" />

      <div className="absolute top-24 left-36 w-px h-40 bg-gradient-to-b from-noir-border to-transparent hidden lg:block" />
      <div className="absolute top-24 right-36 w-px h-40 bg-gradient-to-b from-noir-border to-transparent hidden lg:block" />

      <div className="w-full max-w-md border border-noir-border bg-noir-terminal/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full border-2 border-electric-lime/50 flex items-center justify-center mb-6 bg-noir-terminal">
            <div className="w-8 h-8 rounded-full border-2 border-electric-lime animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-sm text-muted-text mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-electric-lime hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              required
              className="bg-noir-bg/50 border-noir-border focus:border-electric-lime h-12 pl-11 text-sm rounded-lg transition-all placeholder:text-muted-text"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              required
              className="bg-noir-bg/50 border-noir-border focus:border-electric-lime h-12 pl-11 text-sm rounded-lg transition-all placeholder:text-muted-text"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
              className="bg-noir-bg/50 border-noir-border focus:border-electric-lime h-12 pl-11 text-sm rounded-lg transition-all placeholder:text-muted-text"
            />
          </div>

          {error && <div className="border border-signal-red/30 bg-signal-red/5 text-signal-red text-xs p-3 rounded-lg text-center">{error}</div>}

          {/* Sign Up Button */}
          <Button className="w-full h-12 bg-electric-lime text-black hover:bg-electric-lime/90 transition-all duration-300 font-semibold text-sm rounded-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
          </Button>

          {/* OR Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-noir-border" />
            <span className="text-xs text-muted-text uppercase">or</span>
            <div className="flex-1 h-px bg-noir-border" />
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 h-11 bg-noir-bg/50 border-noir-border hover:border-white hover:bg-noir-border rounded-lg transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </Button>
            <Button type="button" variant="outline" className="flex-1 h-11 bg-noir-bg/50 border-noir-border hover:border-white hover:bg-noir-border rounded-lg transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </Button>
            <Button type="button" variant="outline" className="flex-1 h-11 bg-noir-bg/50 border-noir-border hover:border-white hover:bg-noir-border rounded-lg transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

