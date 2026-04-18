# MedDebt Calculator

A high-performance fintech product for medical students and doctors — built around
an interactive med-school debt calculator with PSLF vs. standard comparison,
net-worth crossover, scenario presets, and a full MDX-powered guide blog.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · Recharts · Sanity CMS · MDX
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
  layout.tsx              # Minimal root (fonts, metadata, GA, AdSense loader)
  (site)/                 # Public-site route group — has Header + Footer
    layout.tsx
    page.tsx              # Homepage (hero, calculator, FAQ, blog preview)
    blog/
      page.tsx            # Blog index
      [slug]/page.tsx     # Individual article (Markdown from Sanity)
  studio/                 # Embedded Sanity Studio CMS at /studio
    layout.tsx
    [[...tool]]/page.tsx
  api/
    subscribe/route.ts    # Newsletter subscribe stub — swap for your provider
  globals.css             # Design tokens, prose overrides, utility classes
  sitemap.ts              # Auto-generated sitemap (pulls from Sanity)
  robots.ts

sanity/                   # Sanity Studio config (schemas + structure)
  env.ts                  # Env var loader
  structure.ts            # Studio navigation structure
  schemaTypes/
    post.ts               # Blog post schema (markdown body + FAQs)
    faq.ts                # Reusable FAQ object
    index.ts
sanity.config.ts          # Studio plugins + dataset config
sanity.cli.ts             # CLI config (imports, deploys)

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
  layout/                 # Header, Footer, NewsletterSignup
  ads/AdSlot.tsx          # AdSense-ready ad unit / placeholder

lib/
  calculator.ts           # All financial math (amortization, PSLF, opportunity cost…)
  specialties.ts          # 16 specialty presets (salary + training duration)
  sanity.client.ts        # Sanity fetch client (server-side)
  sanity.queries.ts       # GROQ queries
  blog.ts                 # Blog data loader (calls Sanity)
  pdf.ts                  # Client-side PDF export (jsPDF + autotable, lazy-loaded)

scripts/
  generate-sanity-seed.mjs  # Converts content/blog/*.mdx → sanity-seed.ndjson

content/
  blog/                   # Legacy MDX source — used ONLY as seed input now.
                          # All runtime content comes from Sanity.

sanity-seed.ndjson        # Generated import file — ready for `sanity dataset import`
```

---

## Blog / CMS (Sanity)

The blog is powered by **Sanity Studio embedded at `/studio`** — non-technical
editors can create, edit, and publish articles from a full GUI with no code,
no deploy. Markdown is used for the body (tables, links, headings preserved
exactly), rendered server-side via `next-mdx-remote`.

### 1. First-time setup

1. Create a free Sanity project at https://sanity.io/manage
   (or via `npx sanity@latest init` in a separate folder, then copy the IDs).
2. Copy `NEXT_PUBLIC_SANITY_PROJECT_ID` + `NEXT_PUBLIC_SANITY_DATASET`
   (usually `production`) into `.env.local`.
3. Import the 5 existing SEO articles so your Studio isn't empty:

   ```bash
   npx sanity login             # one-time auth
   npm run sanity:seed:import   # reads sanity-seed.ndjson → your dataset
   ```

4. `npm run dev`, then open **http://localhost:3000/studio** — you should see
   all 5 posts ready to edit.
5. Deploy Studio at the same domain by deploying the whole Next.js app.
   Optionally, `npm run sanity:deploy` also hosts a standalone copy at
   `https://<project>.sanity.studio` for content-ops access.

### 2. Publishing a new post

1. Go to `/studio` → "Blog posts" → "Create new".
2. Fill in:
   - **Title** (used as H1 + meta title)
   - **URL slug** (auto-generated from title; edit if needed)
   - **Description** (meta description, 150–200 chars)
   - **Published date**
   - **Reading time** (e.g. "7 min read")
   - **Body** (Markdown editor — supports headings `##`, `###`, tables, lists, links)
   - **FAQs** (optional — each becomes a collapsible card + FAQPage JSON-LD)
3. Click **Publish**. The article appears at `/blog/<slug>` within 60 seconds
   (ISR revalidation window — configurable in `lib/blog.ts`).

### 3. Regenerating the seed file

If you add more articles to `content/blog/*.mdx` (legacy source of truth)
and want to re-seed a fresh Sanity dataset:

```bash
npm run sanity:seed:generate   # rewrites sanity-seed.ndjson from MDX files
npm run sanity:seed:import     # imports into the `production` dataset
```

`sanity-seed.ndjson` uses deterministic document IDs (`post-<slug>`) so
re-imports update existing documents rather than duplicating them.

**Document schema (`sanity/schemaTypes/post.ts`):**

| Field         | Required | Notes                                                                 |
|---------------|----------|-----------------------------------------------------------------------|
| `title`       | yes      | Used as `<h1>`, meta title, OG title, sitemap.                        |
| `slug`        | yes      | URL slug — becomes `/blog/<slug>`.                                    |
| `description` | yes      | Meta description + OG description (80–200 chars).                     |
| `date`        | yes      | Publication date. Sorts blog index + `datePublished` in Article schema.|
| `readingTime` | yes      | Free text, e.g. "8 min read".                                         |
| `keyword`     | no       | Focus keyword for your own tracking.                                  |
| `body`        | yes      | Markdown body. GFM extensions (tables, links, lists) all render.      |
| `faqs`        | no       | Array of `{ q, a }`. When present, renders a collapsible section + emits FAQPage JSON-LD. |

---

## Environment variables

| Variable                          | Purpose                                                              | Required |
|-----------------------------------|----------------------------------------------------------------------|----------|
| `NEXT_PUBLIC_SITE_URL`            | Canonical URL used in sitemap, OG tags, schema `@id`.                | Prod     |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`   | Sanity project ID from sanity.io/manage.                             | **yes**  |
| `NEXT_PUBLIC_SANITY_DATASET`      | Sanity dataset name (usually `production`).                          | **yes**  |
| `NEXT_PUBLIC_SANITY_API_VERSION`  | Sanity API version (defaults to `2024-10-01`).                       | no       |
| `SANITY_API_READ_TOKEN`           | Read token for draft previews (optional).                            | no       |
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

- **No real newsletter integration.** The `/api/subscribe` endpoint is a stub.
- **No deployment scripts.** Built assuming Vercel; just connect the repo and
  set env vars in the dashboard.

---

## License & disclaimer

Educational calculator only. Projections are estimates — not financial advice.
Always consult a licensed student-loan advisor for decisions about PSLF,
refinancing, or repayment strategy.
