"use server";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { JWTPayload, SignJWT, jwtVerify } from "jose";

export interface Cookie {
  accessToken?: string;
  tempToken?: string;
  role?: string;
  email?: string;
}
export interface Cookies extends JWTPayload {
  cookie: Cookie;
}

const KEY = "medex-admin-panel-token";
const SECRET_KEY = new TextEncoder().encode(process.env.COOKIES_SECRET_KEY);

const getExpirationTime = () => {
  const BASE_TIME = 60 * 60 * 24 * 1000;
  return BASE_TIME * 3;
};

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expires as Date | string | number)
    .sign(SECRET_KEY);
}

export async function decrypt(input: string): Promise<Cookies | null> {
  try {
    const { payload } = await jwtVerify(input, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as Cookies;
  } catch (error) {
    console.error("Error decrypting cookie:", error);
    return null;
  }
}

export const getCookies = async <T = Cookies>(
  Key?: string,
): Promise<T | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(Key ?? KEY)?.value;
  if (!accessToken) return null;
  return (await decrypt(accessToken)) as T;
};

type CreateCookies<T> = {
  cookie: T;
  key?: string;
  expiresAt?: Date | number;
};

export const createCookies = async <T>({
  cookie,
  key = KEY,
  expiresAt,
}: CreateCookies<T>) => {
  const expires = new Date(expiresAt ?? Date.now() + getExpirationTime());
  const token = await encrypt({ cookie, expires });
  const cookieStore = await cookies();
  cookieStore.set(key, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expires,
    path: "/",
  });
};

export async function updateCookies(request: NextRequest) {
  const session = request.cookies.get(KEY)?.value;
  if (!session) return;
  const parsed = await decrypt(session);
  const updatedParsed = {
    ...parsed,
    expires: new Date(Date.now() + getExpirationTime()),
  };
  const res = NextResponse.next();
  res.cookies.set({
    name: KEY,
    value: await encrypt(updatedParsed),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    expires: updatedParsed.expires,
  });
  return res;
}

export const clearCookies = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(KEY);
};
