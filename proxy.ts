import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/calendar")
    return NextResponse.redirect(new URL("/cities", request.url));
  // Calendar pages moved from /events; keep shared links and sent emails working.
  if (pathname === "/events" || pathname.startsWith("/events/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/events/, "/calendar");
    if (url.pathname === "/calendar") url.pathname = "/cities";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/seasons")
    return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
