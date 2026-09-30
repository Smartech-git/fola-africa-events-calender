import { Inter } from "next/font/google";
import localFont from "next/font/local";

import type { Metadata, Viewport } from "next";

import "@/app/styles/globals.css";
import Header from "@/components/header/header";
import LenisProvider from "@/components/providers/lenis-provider";
import Toast from "@/components/ui/toast";
import { siteUrl, siteDescription } from "@/lib/metadata";

const apris = localFont({
  src: [
    {
      path: "../../public/font/Apris-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/font/Apris-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
  ],
  variable: "--apris",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: { default: "FOLA | Africa’s Events Calendar", template: "%s | FOLA" },
  description: siteDescription,
  metadataBase: siteUrl,
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
      className={`${apris.variable} ${inter.variable} scrollbar-thin h-full bg-primary-light font-inter antialiased scrollbar-thumb-primary scrollbar-track-primary-light max-sm:scrollbar-none`}
    >
      <body className="w-full bg-primary-light text-dark-gray">
        <LenisProvider>
          <Header hideLogo className="flex-none bg-primary-light" />
          {children}
          <Toast />
        </LenisProvider>
      </body>
    </html>
  );
}
