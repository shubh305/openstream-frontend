import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  const { pathname, searchParams } = request.nextUrl;

  const protectedRoutes = ["/studio", "/upload", "/subscriptions", "/library", "/settings", "/playlist"];
  const authRoutes = ["/login", "/signup"];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!sessionToken) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      if (searchParams.toString()) {
        url.searchParams.set("query", searchParams.toString());
      }
      return NextResponse.redirect(url);
    }
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
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
