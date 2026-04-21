import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";

/**
 * Public-site layout — wraps every page under the `(site)` route group
 * (home, /blog/*). This is what ships Header + Footer.
 *
 * Other top-level routes like `/studio` and `/api/*` intentionally sit
 * outside this group so the embedded Sanity Studio can own the full
 * viewport with no site chrome (and no Lenis interference).
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-full flex flex-col">
      <SmoothScroll />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
