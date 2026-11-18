import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { hasMemberSession, updateCookies } from "@/lib/cookies";

const under = (path: string) => (pathname: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

const signIn = (next: string) => `/sign-in?${new URLSearchParams({ next })}`;

const PROTECTED: {
  matches: (pathname: string) => boolean;
  redirectTo: (next: string) => string;
}[] = [
  { matches: under("/account"), redirectTo: signIn },
  {
    matches: (pathname) => /^\/calendar\/[^/]+\/[^/]+/.test(pathname),
    redirectTo: signIn,
  },
  {
    matches: under("/submit-event/success"),
    redirectTo: () => "/submit-event",
  },
  {
    matches: under("/submit-event"),
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

  const guard = PROTECTED.find(({ matches }) => matches(pathname));
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
