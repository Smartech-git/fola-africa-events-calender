import type { Metadata } from "next";

import { SITE_NAME } from "@/constants/brand";

export const siteUrl = new URL(
  process.env.BASE_URL || "https://fola-africa-events-calender.vercel.app",
);

export const siteDescription = `Discover creative, cultural and business events across Africa. Explore city calendars and find your next event with ${SITE_NAME}.`;

export const openGraphImage = {
  url: new URL("/opengraph-image", siteUrl).toString(),
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: SITE_NAME,
};

export const twitterImage = {
  url: new URL("/twitter-image", siteUrl).toString(),
  alt: openGraphImage.alt,
};

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const pageTitle = title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
  return {
    title: title === SITE_NAME ? { absolute: SITE_NAME } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: pageTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_GB",
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [twitterImage],
    },
  };
}
