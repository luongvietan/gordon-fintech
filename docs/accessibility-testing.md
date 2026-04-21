# Accessibility testing

We run automated WCAG 2.1 AA checks with [pa11y-ci](https://github.com/pa11y/pa11y-ci) against every top-level route. This is a lightweight smoke test — it will not catch every accessibility regression (screen-reader UX, focus order in dynamic UIs, semantic nuance), but it will flag the low-hanging fruit that breaks ~80% of users with assistive tech: missing alt text, broken landmarks, low-contrast color, missing form labels, and buttons without accessible names.

## Running

Three scripts are wired into `package.json`:

```bash
# Assumes dev server is already running on :3000
npm run a11y

# One-shot: dev server + tests + teardown (fastest local feedback loop)
npm run a11y:dev

# One-shot against a production build (slower, matches what users actually see)
npm run a11y:build
```

`a11y:dev` and `a11y:build` use [`start-server-and-test`](https://github.com/bahmutov/start-server-and-test) to wait for the server to be reachable on `http://localhost:3000` before invoking pa11y, and kill the server once pa11y exits — so the scripts always produce a clean exit code suitable for CI.

## What is covered

Route list lives in `.pa11yci.json`. Every public-facing page is audited:

- `/` (homepage — FAQ, comparison matrix, hero)
- `/calculator` (direct tool entry, SoftwareApplication + Breadcrumb schema)
- `/compare` (saved scenarios view)
- `/about`, `/methodology`, `/privacy`, `/terms` (static content pages)
- `/blog` (index)
- `/specialty` (index) + 5 representative specialty slugs (primary-care, dermatology, neurosurgery, pediatrics, radiology) spanning the whole debt-to-income spectrum so rendering edge cases surface

Add a URL to the `urls` array when shipping a new route. Specialty pages are parameterized — if a rendering bug only affects certain specialties, bump the sample set rather than auditing all 16 (keeps runtime under a minute).

## Configuration

See `.pa11yci.json`. The defaults we ship:

- `standard: "WCAG2AA"` — stricter than A, less pedantic than AAA. Matches the guide's "WCAG AA color contrast" target.
- `wait: 2500` — gives the client-side calculator time to hydrate and paint, so we aren't scoring against the SSR skeleton.
- `ignore: ["notice", "warning"]` — only hard "error" severity fails the run. Notices and warnings are informational and often flag patterns we've deliberately accepted.
- `hideElements` drops the GA / GTM / AdSense iframes from the report because those run third-party code we can't fix.

## Interpreting failures

pa11y output groups findings by rule ID (e.g. `WCAG2AA.Principle1.Guideline1_3.1_3_1.H43`). The two we most commonly hit in this codebase:

- **Color contrast (`color-contrast`)** — most often triggered by muted text on off-white surfaces. Check `var(--text-muted)` vs the surface; bump to `var(--text-secondary)` if a fix is needed. Don't weaken the design unless the contrast is actually broken — pa11y can misreport contrast on layered backgrounds.
- **Missing form label (`label`)** — our custom `NumberField` and `Select` components provide labels via `<label htmlFor>`. If a new input skips the label prop, pa11y catches it immediately.

## CI integration

Not wired to GitHub Actions yet. When we do:

```yaml
- run: npm run a11y:build
```

is all you need. Non-zero exit code on any failing page, no additional flags.

## When automated testing isn't enough

pa11y cannot test:

- **Keyboard navigation flow** — tab order, focus traps in modals, skip-link behavior. Do this manually with Tab / Shift+Tab on each new interactive surface.
- **Screen reader UX** — whether a dynamic chart announces meaningfully. Pair-test with VoiceOver (macOS: Cmd+F5) or NVDA (Windows) before shipping major UI work.
- **Cognitive load / copy clarity** — WCAG has thoughts on plain language, but automation won't catch jargon. Copy review is still a human job.

Keep the automated pass green; supplement with manual passes on the calculator flow whenever inputs or result layouts change.
