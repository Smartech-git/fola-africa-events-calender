import "server-only";

import { cookies } from "next/headers";

import { FILTER_KEYS } from "@/constants/filters";
import type { EventSearchParams } from "@/lib/events/event-list";

/**
 * The visitor's chosen city: the siteCity param when a link carries one,
 * otherwise the choice remembered from the home page's city select.
 */
export async function getSiteCity(params: EventSearchParams) {
  const value = params[FILTER_KEYS.siteCity];
  const param = Array.isArray(value) ? value[0] : value;
  if (param) return param;
  return (await cookies()).get(FILTER_KEYS.siteCity)?.value;
}
