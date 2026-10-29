import { Courier_Prime } from "next/font/google";
import localFont from "next/font/local";

import type { Metadata, Viewport } from "next";

import "@/app/styles/globals.css";
import BackToTop from "@/components/common/back-to-top";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import LenisProvider from "@/components/providers/lenis-provider";
import Toast from "@/components/ui/toast";
import { SITE_NAME } from "@/constants/brand";
import {
  siteUrl,
  siteDescription,
  openGraphImage,
  twitterImage,
} from "@/lib/metadata";

const montreal = localFont({
  src: [
    {
      path: "../../public/font/ppneuemontreal-book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/font/ppneuemontreal-italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/font/ppneuemontreal-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/font/ppneuemontreal-semibolditalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/font/ppneuemontreal-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--montreal",
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--courier-prime",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: siteDescription,
  metadataBase: siteUrl,
  openGraph: { images: [openGraphImage] },
  twitter: { card: "summary_large_image", images: [twitterImage] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000" },
    { media: "(prefers-color-scheme: light)", color: "#000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montreal.variable} ${courierPrime.variable} scrollbar-thin h-dvh bg-red font-courier scrollbar-thumb-red scrollbar-track-white`}
    >
      <body className="w-full bg-white text-ink">
        <LenisProvider>
          <Header />
          {children}
          <Footer />
          <Toast />
          <BackToTop />
        </LenisProvider>
      </body>
    </html>
  );
}
