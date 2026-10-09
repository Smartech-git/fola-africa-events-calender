import type { ReactNode } from "react";

import type { Metadata } from "next";

import { SITE_NAME } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Email preview | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

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
          background: "#F4F1EE",
          color: "#201D1D",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
