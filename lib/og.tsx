/**
 * Shared building blocks for the dynamic Open Graph image routes.
 *
 * Every `opengraph-image.tsx` under `app/(site)/**` should reuse
 * `OG_SIZE`, `OG_CONTENT_TYPE`, and `loadOgFonts()` so the artwork
 * stays brand-consistent and the cold-start cost (font fetch) is
 * paid in one shared module.
 *
 * Why a shared template (not three near-identical files):
 *   - Single place to tweak brand color, padding, type scale.
 *   - Same font binary is fetched once per route group and cached.
 *   - Easier to keep the Twitter card identical to the OG card —
 *     the twitter-image route just re-exports the OG handler.
 */

import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

/**
 * Inter font binaries hosted on jsDelivr's `@fontsource/inter` mirror.
 * Pinned to a major version so the OG card never silently restyles
 * because of a remote-font update. Both files are well under 200 KB
 * and are cached by jsDelivr's edge.
 *
 * Note: we use TTF (not WOFF2) because Satori — the renderer behind
 * `ImageResponse` — has the broadest compatibility with TTF.
 */
const FONT_BLACK_URL =
  'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-900-normal.woff';
const FONT_MEDIUM_URL =
  'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-500-normal.woff';
const FONT_BOLD_URL =
  'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff';

let cachedFonts: Awaited<ReturnType<typeof loadOgFontsImpl>> | null = null;

async function loadOgFontsImpl() {
  const [black, bold, medium] = await Promise.all([
    fetch(FONT_BLACK_URL).then((r) => r.arrayBuffer()),
    fetch(FONT_BOLD_URL).then((r) => r.arrayBuffer()),
    fetch(FONT_MEDIUM_URL).then((r) => r.arrayBuffer()),
  ]);

  return [
    { name: 'Inter', data: black, weight: 900 as const, style: 'normal' as const },
    { name: 'Inter', data: bold, weight: 700 as const, style: 'normal' as const },
    { name: 'Inter', data: medium, weight: 500 as const, style: 'normal' as const },
  ];
}

export async function loadOgFonts() {
  if (cachedFonts) return cachedFonts;
  cachedFonts = await loadOgFontsImpl();
  return cachedFonts;
}

// ─── Brand palette (must mirror globals.css) ───────────────────
const NEAR_BLACK = '#0e0f0c';
const WISE_GREEN = '#9fe870';
const DARK_GREEN = '#163300';
const WHITE_72 = 'rgba(255,255,255,0.72)';
const WHITE_45 = 'rgba(255,255,255,0.45)';

// ─── Logo (M monogram, matches Header + CredentialsStrip) ──────
function BrandMark() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: WISE_GREEN,
          color: DARK_GREEN,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 36,
          letterSpacing: '-0.04em',
        }}
      >
        M
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            color: 'white',
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.01em',
          }}
        >
          MedDebt Calculator
        </span>
        <span
          style={{
            color: WHITE_45,
            fontSize: 14,
            fontWeight: 500,
            marginTop: 4,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          medschooldebtcalculator.com
        </span>
      </div>
    </div>
  );
}

interface OgCardOptions {
  /** Top eyebrow pill, e.g. category title or "Guide". Optional. */
  eyebrow?: string;
  /** Big headline. */
  title: string;
  /** Optional subheading rendered under the title. */
  subtitle?: string;
  /** Bottom-right metadata row, e.g. ["8 min read", "Aug 2025"]. */
  meta?: string[];
}

/**
 * Returns an `ImageResponse` for the standard 1200×630 OG card.
 * Used by every `opengraph-image.tsx` route in the (site) group.
 */
export async function renderOgCard({
  eyebrow,
  title,
  subtitle,
  meta = [],
}: OgCardOptions) {
  const fonts = await loadOgFonts();

  // Title autoscaling — long headlines don't get clipped, short ones
  // breathe. Threshold tuned against the AAMC/PSLF article titles.
  const titleSize = title.length > 90 ? 60 : title.length > 60 ? 70 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: NEAR_BLACK,
          padding: 64,
          fontFamily: 'Inter',
          position: 'relative',
        }}
      >
        {/* Top-right green glow — same vibe as the dark hero band */}
        <div
          style={{
            position: 'absolute',
            top: -240,
            right: -240,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: WISE_GREEN,
            opacity: 0.18,
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            left: -160,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: WISE_GREEN,
            opacity: 0.08,
            filter: 'blur(80px)',
          }}
        />

        {/* Top row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <BrandMark />
          {eyebrow && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(159,232,112,0.15)',
                color: WISE_GREEN,
                padding: '12px 22px',
                borderRadius: 9999,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid rgba(159,232,112,0.30)',
              }}
            >
              {eyebrow}
            </div>
          )}
        </div>

        {/* Title + subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: titleSize,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                color: WHITE_72,
                fontSize: 26,
                fontWeight: 500,
                lineHeight: 1.35,
                marginTop: 28,
                maxWidth: 940,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
            }}
          >
            {meta.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: WHITE_45,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {i > 0 && (
                  <span
                    style={{
                      display: 'flex',
                      width: 5,
                      height: 5,
                      borderRadius: 9999,
                      background: WHITE_45,
                      marginRight: 22,
                    }}
                  />
                )}
                {item}
              </div>
            ))}
          </div>

          {/* CTA pill — matches the hero "Run my numbers" button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: WISE_GREEN,
              color: DARK_GREEN,
              padding: '16px 28px',
              borderRadius: 9999,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.005em',
            }}
          >
            Run my numbers — free →
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts,
    },
  );
}
