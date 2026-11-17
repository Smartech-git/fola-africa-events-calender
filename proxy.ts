import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { hasMemberSession, updateCookies } from "@/lib/cookies";

const PROTECTED: { path: string; redirectTo: (next: string) => string }[] = [
  {
    path: "/account",
    redirectTo: (next) => `/sign-in?${new URLSearchParams({ next })}`,
  },
  { path: "/submit-event/success", redirectTo: () => "/submit-event" },
  {
    path: "/submit-event",
    redirectTo: (next) => `/create-account?${new URLSearchParams({ next })}`,
  },
];

// Retired routes kept alive for old links and bookmarks.
const REDIRECTS: Record<string, string> = {
  "/calendar": "/cities",
  "/submit-event/form": "/submit-event",
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname in REDIRECTS)
    return NextResponse.redirect(new URL(REDIRECTS[pathname], request.url));

  const guard = PROTECTED.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (guard && !(await hasMemberSession(request)))
    return updateCookies(
      request,
      NextResponse.redirect(
        new URL(guard.redirectTo(`${pathname}${search}`), request.url),
      ),
    );

  return updateCookies(request, NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!api|admin|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
