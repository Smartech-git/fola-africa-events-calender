import "server-only";

import { cookies } from "next/headers";

import { FILTER_KEYS } from "@/constants/filters";
import type { EventSearchParams } from "@/lib/events/event-list";
import { geoCitySlug } from "@/lib/geo-city";

/**
 * The visitor's city: the siteCity param when a link carries one, then the
 * choice remembered from the city select, then a guess from their location
 * when it is one of the calendar's cities. Callers fall back to Lagos.
 * The guess is never saved, so it is not mistaken for a choice.
 */
export async function getSiteCity(params: EventSearchParams) {
  const value = params[FILTER_KEYS.siteCity];
  const param = Array.isArray(value) ? value[0] : value;
  if (param) return param;
  const chosen = (await cookies()).get(FILTER_KEYS.siteCity)?.value;
  if (chosen) return chosen;
  return geoCitySlug();
}
