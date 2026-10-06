import type { Metadata } from "next";

export const siteUrl = new URL(
  process.env.BASE_URL || "https://fola-africa-events-calender.vercel.app",
);

export const siteDescription =
  "Discover creative, cultural and business events across Africa. Explore city calendars and find your next event with FOLA.";

export const openGraphImage = {
  url: new URL("/opengraph-image.png", siteUrl).toString(),
  width: 1443,
  height: 812,
  type: "image/png",
  alt: "FOLA | Africa’s Events Calendar",
};

export const twitterImage = {
  url: new URL("/twitter-image.png", siteUrl).toString(),
  alt: openGraphImage.alt,
};

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
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | FOLA`,
      description,
      images: [twitterImage],
    },
  };
}
