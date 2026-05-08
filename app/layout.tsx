import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://www.medschooldebtcalculator.com";

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

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-VVPVG8L2V8";
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Site-wide structured data. Exposes the Organization + WebSite identity
 * so Google can collapse our search results under a single brand and
 * surface a sitelinks search box. Per-page schema (Article, FAQPage,
 * SoftwareApplication, BreadcrumbList) is added in each route.
 */
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MedDebt Calculator",
  url: SITE_URL,
  description:
    "An independent, evidence-based debt-planning tool built specifically for medical students, residents, and attending physicians.",
  logo: `${SITE_URL}/icon.png`,
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MedDebt",
  url: SITE_URL,
  description:
    "Med school debt calculator with PSLF comparison and net-worth projections for doctors.",
  publisher: { "@type": "Organization", name: "MedDebt Calculator" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        {/* Google AdSense site-wide loader. Must render inside <head> per
            AdSense policy so the crawler can verify the publisher on every
            page. Hardcoded client ID by design — this is a public identifier
            and needs to be present even when NEXT_PUBLIC_ADSENSE_CLIENT is
            unset (e.g. during the initial AdSense site review). */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9661395106750839"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full antialiased bg-white text-[color:var(--text-primary)]">
        {/* WCAG 2.4.1 bypass block — lets keyboard users jump past the
            nav straight to the page's main landmark. Hidden off-screen
            until focused (see `.skip-link` in globals.css). */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
        />

        {children}

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
