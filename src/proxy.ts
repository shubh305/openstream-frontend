import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  const { pathname, searchParams } = request.nextUrl;

  const protectedPaths = ["/studio", "/upload", "/subscriptions"];

  const isProtectedPath = protectedPaths.some(route => pathname.startsWith(route));
  const isWatchLater = pathname === "/playlist" && searchParams.get("list") === "WL";

  if (isProtectedPath || isWatchLater) {
    if (!sessionToken) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for api and static files*/
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
