"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession } from "@/actions/auth";

/**
 * SessionGuard is a client component that periodically checks if the session is still valid.
 * This handles cases where a user stays on a page while their session expires (idle logout).
 */
export function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = useCallback(async () => {
    const protectedRoutes = ["/studio", "/upload", "/subscriptions", "/library", "/settings", "/playlist"];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (!isProtectedRoute) return;

    try {
      const session = await getSession();
      if (!session) {
        console.log("SessionGuard: Session expired, redirecting to login");
        router.refresh();
      }
    } catch (error) {
       console.error("SessionGuard: Error checking session", error);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkSession]);

  return null;
}
