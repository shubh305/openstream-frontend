"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, CheckCircle2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSent(true);
    setIsLoading(false);
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
          <div className="w-16 h-16 rounded-xl border border-noir-border flex items-center justify-center mb-6 bg-noir-terminal overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="OpenStream" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-text mt-2 text-center">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        {isSent ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full border-2 border-electric-lime/50 bg-electric-lime/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-electric-lime" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-electric-lime">Email Sent!</p>
              <p className="text-xs text-muted-text">If an account exists, a recovery link has been sent to your email.</p>
            </div>
            <Button asChild className="w-full h-12 bg-electric-lime text-black hover:bg-electric-lime/90 transition-all duration-300 font-semibold text-sm rounded-lg cursor-pointer">
              <Link href="/login" className="flex items-center justify-center gap-2 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Submit Button */}
            <Button
              className="w-full h-12 bg-electric-lime text-black hover:bg-electric-lime/90 transition-all duration-300 font-semibold text-sm rounded-lg cursor-pointer disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
            </Button>

            <p className="text-center pt-2">
              <Link href="/login" className="text-sm text-muted-text hover:text-white transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
