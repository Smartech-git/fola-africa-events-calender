"use client";

import { useSyncExternalStore } from "react";

import { usePathname } from "next/navigation";

import useSWR from "swr";

import type { AccountSummary } from "@/app/(frontend)/api/account/route";
import { SIGNED_IN_COOKIE } from "@/constants/account";

export const ACCOUNT_ENDPOINT = "/api/account";

const hasSignedInFlag = () =>
  document.cookie
    .split("; ")
    .some((cookie) => cookie === `${SIGNED_IN_COOKIE}=1`);

// Cookies have no change event. Navigation re-renders the caller (usePathname),
// and each render reads the cookie again, so sign-in and sign-out show at once.
const subscribe = () => () => undefined;

const fetchAccount = async (url: string): Promise<AccountSummary> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load the account.");
  return response.json();
};

/**
 * The visitor's account for the header and mobile menu. Pages stay static: the
 * readable flag cookie says whether to ask, and only signed-in visitors fetch
 * their name and pending count.
 */
export function useAccount() {
  usePathname();
  const flagged = useSyncExternalStore(subscribe, hasSignedInFlag, () => false);
  const { data } = useSWR(flagged ? ACCOUNT_ENDPOINT : null, fetchAccount, {
    revalidateOnFocus: true,
  });
  // The flag alone is enough to show "My account"; the summary confirms it.
  const signedIn = flagged && data?.signedIn !== false;
  return { signedIn, account: signedIn ? data : undefined };
}
