import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Forms send text only; artwork uploads go through their own route.
      bodySizeLimit: "1mb",
    },
  },

  images: {
    qualities: [100, 70, 75],
    remotePatterns: [
      // Event artwork in Vercel Blob.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withPayload(nextConfig);
