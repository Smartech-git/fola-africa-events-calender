import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { updateCookies } from "@/lib/cookies";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/calendar")
    return NextResponse.redirect(new URL("/cities", request.url));
  // Members stay signed in while they keep using the site.
  return updateCookies(request, NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!api|admin|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
