import Image from 'next/image';

interface Props {
  slug: string;
  title: string;
  /** Sanity-provided cover image URL (null/undefined shows gradient fallback) */
  coverImageUrl?: string | null;
  className?: string;
}

/**
 * Deterministic hash so the same slug always lands on the same gradient.
 * djb2 — tiny + collision-resistant enough for palette selection.
 */
function hashSlug(slug: string): number {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) + h) ^ slug.charCodeAt(i);
  }
  return Math.abs(h);
}

const PALETTES: ReadonlyArray<[string, string]> = [
  ['#B9F862', '#285B3E'], // wise-green → dark-green
  ['#DFFFA8', '#285B3E'], // light-mint → dark-green
  ['#E8F5D8', '#111'],    // pale → near-black
  ['#CFF2E4', '#0F3B2E'], // teal-mint → deep teal
  ['#B9F862', '#0F3B2E'],
  ['#E6F0FF', '#1A3059'], // soft blue
];

function ChartGlyph({ hue }: { hue: number }) {
  // Three stylized glyphs chosen by hash % 3.
  const i = hue % 3;

  if (i === 0) {
    // Rising line
    return (
      <path
        d="M20 140 L70 110 L110 125 L150 80 L200 60 L240 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    );
  }
  if (i === 1) {
    // Two curves crossing
    return (
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 40 Q 80 60 130 90 T 240 140" opacity="0.85" />
        <path d="M20 140 Q 80 120 130 95 T 240 45" opacity="0.55" />
      </g>
    );
  }
  // Stacked bars
  return (
    <g fill="currentColor" opacity="0.85">
      <rect x="30" y="100" width="22" height="60" rx="3" />
      <rect x="64" y="80" width="22" height="80" rx="3" />
      <rect x="98" y="55" width="22" height="105" rx="3" />
      <rect x="132" y="40" width="22" height="120" rx="3" />
      <rect x="166" y="25" width="22" height="135" rx="3" />
      <rect x="200" y="15" width="22" height="145" rx="3" opacity="1" />
    </g>
  );
}

export default function PostThumbnail({ slug, title, coverImageUrl, className }: Props) {
  if (coverImageUrl) {
    return (
      <div
        className={`relative w-full aspect-[16/9] overflow-hidden rounded-[var(--r-card-sm)] bg-[color:var(--color-off-white)] ${
          className ?? ''
        }`}
      >
        <Image
          src={coverImageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
    );
  }

  const hash = hashSlug(slug);
  const [from, to] = PALETTES[hash % PALETTES.length];
  const rotate = (hash % 90) - 45; // -45..44 deg

  return (
    <div
      className={`relative w-full aspect-[16/9] overflow-hidden rounded-[var(--r-card-sm)] ${className ?? ''}`}
      style={{
        background: `linear-gradient(${rotate}deg, ${from} 0%, ${to} 100%)`,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 260 180"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full text-white/90"
      >
        <ChartGlyph hue={hash} />
      </svg>
    </div>
  );
}
