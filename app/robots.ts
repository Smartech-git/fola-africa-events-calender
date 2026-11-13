import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/account",
        "/sign-in",
        "/create-account",
        "/submit-event/form",
        "/submit-event/success",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
