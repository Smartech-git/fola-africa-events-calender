import type { Metadata } from "next";

export const siteUrl = new URL(process.env.BASE_URL || "http://localhost:3000");
export const siteDescription =
  "Discover creative, cultural and business events across Africa. Explore city calendars and find your next event with FOLA.";

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | FOLA`,
      description,
      url: path,
      siteName: "FOLA",
      type: "website",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | FOLA`,
      description,
    },
  };
}
