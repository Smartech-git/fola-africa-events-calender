import { createHash } from "crypto";

import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { JWTPayload, SignJWT, jwtVerify } from "jose";

import {
  SESSION_COOKIE,
  SESSION_DAYS,
  SIGNED_IN_COOKIE,
} from "@/constants/account";

const DAY = 24 * 60 * 60 * 1000;
// Rolling sessions are re-signed at most once a day, not on every request.
const REFRESH_AFTER = DAY;

export interface Cookies<T> extends JWTPayload {
  cookie: T;
}

function secretKey() {
  const secret = process.env.COOKIES_SECRET_KEY || process.env.PAYLOAD_SECRET;
  if (!secret)
    throw new Error("COOKIES_SECRET_KEY or PAYLOAD_SECRET is required.");
  // A key of its own, so these cookies never verify as Payload tokens.
  return createHash("sha256").update(`hoa-cookies:${secret}`).digest();
}

const sessionExpiry = () => new Date(Date.now() + SESSION_DAYS * DAY);

const cookieOptions = (expires: Date, httpOnly = true) => ({
  httpOnly,
  secure: process.env.NODE_ENV === "production",
  // Lax: sent when following a link to the site, never on cross-site posts.
  sameSite: "lax" as const,
  expires,
  path: "/",
});

export async function encrypt<T>(cookie: T, expires: Date) {
  return await new SignJWT({ cookie })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secretKey());
}

/** The cookie's contents, or null when it is missing, expired or tampered with. */
export async function decrypt<T>(input: string): Promise<Cookies<T> | null> {
  try {
    const { payload } = await jwtVerify(input, secretKey(), {
      algorithms: ["HS256"],
    });
    return payload as Cookies<T>;
  } catch {
    return null;
  }
}

export const getCookies = async <T>(
  key = SESSION_COOKIE,
): Promise<Cookies<T> | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(key)?.value;
  if (!token) return null;
  return await decrypt<T>(token);
};

type CreateCookies<T> = {
  cookie: T;
  key?: string;
  expiresAt?: Date | number;
};

/** Call from a server action or route handler. */
export const createCookies = async <T>({
  cookie,
  key = SESSION_COOKIE,
  expiresAt,
}: CreateCookies<T>) => {
  const expires = new Date(expiresAt ?? sessionExpiry());
  const cookieStore = await cookies();
  cookieStore.set(key, await encrypt(cookie, expires), cookieOptions(expires));
  if (key === SESSION_COOKIE)
    cookieStore.set(SIGNED_IN_COOKIE, "1", cookieOptions(expires, false));
};


export async function updateCookies(
  request: NextRequest,
  response: NextResponse,
) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    if (request.cookies.has(SIGNED_IN_COOKIE))
      response.cookies.delete(SIGNED_IN_COOKIE);
    return response;
  }
  const parsed = await decrypt(token);
  if (!parsed) {
    response.cookies.delete(SESSION_COOKIE);
    response.cookies.delete(SIGNED_IN_COOKIE);
    return response;
  }
  if (parsed.iat && Date.now() - parsed.iat * 1000 < REFRESH_AFTER)
    return response;
  const expires = sessionExpiry();
  response.cookies.set(
    SESSION_COOKIE,
    await encrypt(parsed.cookie, expires),
    cookieOptions(expires),
  );
  response.cookies.set(SIGNED_IN_COOKIE, "1", cookieOptions(expires, false));
  return response;
}

export const clearCookies = async (key = SESSION_COOKIE): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(key);
  if (key === SESSION_COOKIE) cookieStore.delete(SIGNED_IN_COOKIE);
};
