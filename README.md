# MedDebt Calculator

A high-performance fintech product for medical students and doctors — built around
an interactive med-school debt calculator with PSLF vs. standard comparison,
net-worth crossover, scenario presets, and a full MDX-powered guide blog.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · Recharts · MDX
**Design system:** Wise-inspired (lime green `#9fe870` + near-black `#0e0f0c`, Inter 900 display).

---

## Quick start

```bash
# Install
npm install           # or pnpm install / yarn

# Dev server
npm run dev           # http://localhost:3000

# Production build
npm run build
npm start
```

Copy `.env.local.example` to `.env.local` and fill in the values you want. All
env vars are optional — features silently disable if unset.

---

## Project structure

```
app/
  layout.tsx              # Root layout (fonts, metadata, GA, AdSense loader)
  page.tsx                # Homepage (hero, calculator, FAQ, blog preview)
  blog/
    page.tsx              # Blog index
    [slug]/page.tsx       # Individual article (MDX)
  api/
    subscribe/route.ts    # Newsletter subscribe stub — swap for your provider
  globals.css             # Design tokens, prose overrides, utility classes
  sitemap.ts              # Auto-generated sitemap
  robots.ts

components/
  calculator/             # Calculator shell + inputs + results + charts
    Calculator.tsx
    CalculatorInputs.tsx
    CalculatorResults.tsx
    charts/
      BalanceChart.tsx
      NetWorthChart.tsx
      ComparisonChart.tsx
  ui/                     # Design-system primitives
    Button.tsx            # Lime pill, subtle, ghost variants
    Input.tsx             # Ring-shadow input
    Select.tsx            # Ring-shadow select
    Toggle.tsx            # Lime-green switch
    Slider.tsx            # Range slider (tax, inflation, return)
    Card.tsx              # 16/30/40 radius cards
  layout/
    Header.tsx            # Sticky nav with mobile menu
    Footer.tsx            # 4-column footer + legal strip
    NewsletterSignup.tsx  # Dark card + lime CTA
  ads/
    AdSlot.tsx            # AdSense-ready ad unit / placeholder

lib/
  calculator.ts           # All financial math (amortization, PSLF, opportunity cost…)
  specialties.ts          # 16 specialty presets (salary + training duration)
  blog.ts                 # MDX frontmatter loader
  pdf.ts                  # Client-side PDF export (jsPDF + autotable, lazy-loaded)

content/
  blog/                   # Write blog posts here — one .mdx per article
```

---

## Adding a blog post

The blog is file-based — no CMS, no login, no deploy UI. Just write markdown.

1. Create a new file at `content/blog/<url-slug>.mdx`.
2. Add frontmatter at the top:

```mdx
---
title: "How PSLF Works for Doctors: 2025 Guide"
description: "A step-by-step walkthrough of PSLF eligibility, IDR plans, and the 120-payment rule for physicians."
date: "2025-04-14"
readingTime: "8 min read"
keyword: "PSLF for doctors"
faqs:
  - q: "Is PSLF really tax-free?"
    a: "Yes — federal PSLF forgiveness is tax-free at the federal level."
  - q: "Does residency count toward the 120 payments?"
    a: "Yes — as long as your hospital qualifies as a 501(c)(3) and you're on an income-driven repayment plan."
---

## Your H2 lives here

Markdown, tables, links — all supported via `remark-gfm`.
Internal links to `/blog/...` or `/#calculator` are strongly encouraged.
```

3. Save. The post will auto-appear in the blog index on next build (or hot-reload in dev).

**Frontmatter fields:**

| Field         | Required | Notes                                                                 |
|---------------|----------|-----------------------------------------------------------------------|
| `title`       | yes      | Used in `<h1>`, meta title, OG title, sitemap.                        |
| `description` | yes      | Meta description + OG description (150–160 char sweet spot).          |
| `date`        | yes      | `YYYY-MM-DD`. Used for sorting + `datePublished` in Article schema.   |
| `readingTime` | yes      | Free text (e.g. "8 min read").                                        |
| `keyword`     | no       | Focus keyword for your own tracking.                                  |
| `faqs`        | no       | Array of `{ q, a }`. When present, renders a collapsible section + emits FAQPage JSON-LD. |

---

## Environment variables

| Variable                          | Purpose                                                              | Required |
|-----------------------------------|----------------------------------------------------------------------|----------|
| `NEXT_PUBLIC_SITE_URL`            | Canonical URL used in sitemap, OG tags, schema `@id`.                | Prod     |
| `NEXT_PUBLIC_GA_ID`               | Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`).                  | no       |
| `NEXT_PUBLIC_GSC_TOKEN`           | Google Search Console verification token.                            | no       |
| `NEXT_PUBLIC_ADSENSE_CLIENT`      | AdSense publisher ID (`ca-pub-…`). Enables ad loading.               | no       |
| `NEXT_PUBLIC_ADSENSE_BANNER_SLOT` | AdSense slot ID for the homepage banner.                             | no       |
| `NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT`| AdSense slot ID for the blog article sidebar.                        | no       |

Without `NEXT_PUBLIC_ADSENSE_CLIENT`, ad slots render as neutral placeholders.

---

## Customizing

### Design tokens (colors, radius, shadows)

All tokens live at the top of `app/globals.css` under `:root`. Change once, ripple
everywhere. Key variables:

- `--color-wise-green` — accent lime
- `--color-near-black` — primary ink / dark sections
- `--color-dark-green` — text on lime surfaces
- `--r-pill`, `--r-card-sm`, `--r-card`, `--r-card-lg` — radius scale
- `--shadow-ring` — the 1-px ring that replaces drop shadows throughout

### Specialty presets

Edit `lib/specialties.ts`. The `SPECIALTIES` array is consumed by the calculator's
specialty dropdown. Each entry supplies median attending salary + total
training duration.

### Calculator assumptions

Edit `lib/calculator.ts`:

- `RESIDENT_SALARY` and `POVERTY_LINE_150` → `lib/specialties.ts`
- Default PSLF horizon (120 months) and max attending horizon (30 years) are
  constants inside `calculateOutputs`.
- Add new scenario presets in `applyScenarioPreset`.

### Newsletter provider

`app/api/subscribe/route.ts` is a stub that returns `{ ok: true }`. Replace the
handler body with a `fetch()` to ConvertKit / Mailchimp / Resend. A commented
example lives at the top of the file.

---

### PDF export

The calculator header has a **Download PDF** button that produces a branded,
multi-page A4 report with:

- KPI summary (monthly payment, payoff time, interest, net-worth crossover)
- PSLF forgiveness callout (when eligible)
- Opportunity-cost callout
- Full input snapshot
- Year-by-year schedule table

The generator lives in `lib/pdf.ts` and uses `jspdf` + `jspdf-autotable`. It's
loaded via dynamic `import()` on click, so the ~150 KB library stays out of
the initial bundle. To customize layout, colors, or sections, edit the
`downloadResultsPdf()` function — all palette values are defined at the top.

---

## Performance notes

- Fonts use `next/font/google` with `display: swap` and subset `latin` to avoid
  layout shift and blocking FOIT.
- AdSense script is conditionally loaded with `strategy="afterInteractive"` and
  only when `NEXT_PUBLIC_ADSENSE_CLIENT` is present — no request otherwise.
- All charts are rendered client-side via `recharts` inside a lazy
  `ResponsiveContainer`. The calculator shell itself is a single
  `'use client'` tree.
- Images aren't used in the current design. If you add them, use `next/image`.

Target Lighthouse scores: **90+ on Performance, SEO, Accessibility, Best Practices**.

---

## SEO checklist (already wired)

- ✓ `<html lang="en">`, semantic landmarks (`<header>`, `<main>`, `<footer>`)
- ✓ Auto-generated `sitemap.xml` + `robots.txt`
- ✓ Per-page `<title>`, meta description, OpenGraph + Twitter cards
- ✓ Canonical URLs on blog posts
- ✓ JSON-LD: `SoftwareApplication` (home), `Article` + `BreadcrumbList` (blog posts),
  `FAQPage` (home + any post with `faqs` in frontmatter)
- ✓ Google Search Console verification via `NEXT_PUBLIC_GSC_TOKEN`
- ✓ Internal linking: every blog CTA → `/#calculator`; sidebar on articles

---

## Out of scope (flagged — not built)

- **No authoring CMS.** Blog posts are MDX files. If you later want a web
  admin, wire the `content/blog/` directory to Sanity, Contentlayer, or a
  headless CMS of your choice.
- **No real newsletter integration.** The `/api/subscribe` endpoint is a stub.
- **No deployment scripts.** Built assuming Vercel; just connect the repo and
  set env vars in the dashboard.

---

## License & disclaimer

Educational calculator only. Projections are estimates — not financial advice.
Always consult a licensed student-loan advisor for decisions about PSLF,
refinancing, or repayment strategy.
