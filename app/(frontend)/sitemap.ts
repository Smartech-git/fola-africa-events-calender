import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/metadata";
import { getCalendarPayload } from "@/payload/queries/calendar-query";

// Rebuilt at most once an hour, so new cities appear without a deploy.
export const revalidate = 3600;

const STATIC_PATHS = [
  "/",
  "/about",
  "/cities",
  "/privacy-policy",
  "/terms-of-use",
];

const url = (path: string) => new URL(path, siteUrl).toString();

// Event pages need a signed-in member, so only city calendars are listed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getCalendarPayload();
  const cities = await payload.find({
    collection: "cities",
    pagination: false,
    depth: 0,
    overrideAccess: false,
    select: { slug: true, updatedAt: true },
  });

  return [
    ...STATIC_PATHS.map((path) => ({ url: url(path) })),
    ...cities.docs.map((city) => ({
      url: url(`/calendar/${encodeURIComponent(city.slug)}`),
      lastModified: city.updatedAt,
    })),
  ];
}
