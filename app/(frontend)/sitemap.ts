import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/metadata";
import {
  getCalendarPayload,
  publicEventBaseFilters,
} from "@/payload/queries/calendar-query";

// Rebuilt at most once an hour, so new cities and events appear without a deploy.
export const revalidate = 3600;

const STATIC_PATHS = [
  "/",
  "/about",
  "/cities",
  "/privacy-policy",
  "/terms-of-use",
];

const url = (path: string) => new URL(path, siteUrl).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getCalendarPayload();
  const [cities, events] = await Promise.all([
    payload.find({
      collection: "cities",
      pagination: false,
      depth: 0,
      overrideAccess: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: "events",
      where: { and: publicEventBaseFilters() },
      pagination: false,
      depth: 0,
      // Only ever read the fields below; raw events hold private details.
      overrideAccess: true,
      select: { slug: true, city: true, updatedAt: true },
    }),
  ]);

  const citySlugs = new Map(cities.docs.map((city) => [city.id, city.slug]));

  return [
    ...STATIC_PATHS.map((path) => ({ url: url(path) })),
    ...cities.docs.map((city) => ({
      url: url(`/calendar/${encodeURIComponent(city.slug)}`),
      lastModified: city.updatedAt,
    })),
    ...events.docs.flatMap((event) => {
      const cityId =
        typeof event.city === "object" ? event.city?.id : event.city;
      const citySlug = cityId ? citySlugs.get(cityId) : undefined;
      if (!citySlug || !event.slug) return [];
      return {
        url: url(
          `/calendar/${encodeURIComponent(citySlug)}/${encodeURIComponent(event.slug)}`,
        ),
        lastModified: event.updatedAt,
      };
    }),
  ];
}
