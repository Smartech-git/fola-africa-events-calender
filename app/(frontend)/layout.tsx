import { Inter } from "next/font/google";
import localFont from "next/font/local";

import type { Metadata, Viewport } from "next";

import "@/app/styles/globals.css";
import LenisProvider from "@/components/providers/lenis-provider";
import Toast from "@/components/ui/toast";
import Header from "@/components/header/header";

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
  title: "FOLA",
  description:
    "We’re a communications and experiential agency dedicated to bridging Africa and the world.",
  metadataBase: new URL("https://wewantfola.com"),
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
