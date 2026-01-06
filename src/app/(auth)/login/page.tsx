"use client";

import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";
import { Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const result = await login(data);

    if (result?.error) {
      setError(result.error);
      toast.error("Login failed", {
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

      {/* Connecting lines */}
      <div className="absolute top-24 left-36 w-px h-40 bg-gradient-to-b from-noir-border to-transparent hidden lg:block" />
      <div className="absolute top-24 right-36 w-px h-40 bg-gradient-to-b from-noir-border to-transparent hidden lg:block" />

      <div className="w-full max-w-md border border-noir-border bg-noir-terminal/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full border-2 border-electric-lime/50 flex items-center justify-center mb-6 bg-noir-terminal">
            <div className="w-8 h-8 rounded-full border-2 border-electric-lime animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-muted-text mt-2">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="text-electric-lime hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="email address"
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

          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-muted-text hover:text-electric-lime transition-colors">
              Forgot password?
            </Link>
          </div>

          {error && <div className="border border-signal-red/30 bg-signal-red/5 text-signal-red text-xs p-3 rounded-lg text-center">{error}</div>}

          {/* Login Button */}
          <Button className="w-full h-12 bg-electric-lime text-black hover:bg-electric-lime/90 transition-all duration-300 font-semibold text-sm rounded-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
          </Button>

        </form>
      </div>
    </div>
  );
}

