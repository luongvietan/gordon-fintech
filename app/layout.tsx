import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://medschooldebtcalculator.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | MedDebt Calculator",
    default: "Med School Debt Calculator — Free Tool for Doctors & Medical Students",
  },
  description:
    "Calculate exactly how long it takes to pay off medical school debt. PSLF comparison, specialty salary presets, net worth projections. Free tool built for doctors.",
  keywords: [
    "med school debt calculator",
    "medical school loan calculator",
    "PSLF calculator for doctors",
    "doctor student loan repayment",
    "physician loan repayment",
  ],
  authors: [{ name: "MedDebt Calculator" }],
  openGraph: {
    type: "website",
    siteName: "MedDebt Calculator",
    locale: "en_US",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: process.env.NEXT_PUBLIC_GSC_TOKEN
    ? { google: process.env.NEXT_PUBLIC_GSC_TOKEN }
    : undefined,
  alternates: {
    canonical: SITE_URL,
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col antialiased bg-white text-[color:var(--text-primary)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />

        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}

        {ADSENSE_CLIENT && (
          <Script
            id="adsense-loader"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
