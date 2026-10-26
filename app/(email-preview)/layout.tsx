import type { ReactNode } from "react";

import type { Metadata } from "next";

import { SITE_NAME } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Email preview | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

// This route group does not load the site stylesheet, so the Happenings
// palette is applied inline.
export default function EmailPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#FFFFFF",
          color: "#1A1A1A",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
