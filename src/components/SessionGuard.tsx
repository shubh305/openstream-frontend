"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession } from "@/actions/auth";

/**
 * SessionGuard is a client component that periodically checks if the session is still valid.
 * This handles cases where a user stays on a page while their session expires (idle logout).
 */
interface SessionGuardProps {
  isAuthenticated?: boolean;
}

export function SessionGuard({ isAuthenticated = false }: SessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = useCallback(async () => {
    const protectedRoutes = ["/studio", "/upload", "/subscriptions", "/library", "/settings", "/playlist"];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (!isProtectedRoute) return;

    try {
      if (!isProtectedRoute && !isAuthenticated) return;

      const session = await getSession();
      if (!session && isAuthenticated) {
        console.log("SessionGuard: Session lost, redirecting to login");
        router.push("/login");
      }
    } catch (error) {
      console.error("SessionGuard: Error checking session", error);
    }
  }, [pathname, router, isAuthenticated]);

  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkSession]);

  return null;
}
