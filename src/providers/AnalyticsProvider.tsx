"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";

function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!pathname) return;
        
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        
        trackEvent(AnalyticsEvent.PAGE_VIEW, {
            path: pathname,
            url: url,
            search: searchParams?.toString() || ""
        });
    }, [pathname, searchParams]);

    return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={null}>
                <AnalyticsTracker />
            </Suspense>
            {children}
        </>
    );
}
