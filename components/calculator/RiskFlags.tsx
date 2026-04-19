'use client';

import { Info, AlertTriangle } from 'lucide-react';
import type { RiskFlag } from '@/lib/risk-flags';

interface Props {
  flags: RiskFlag[];
}

/**
 * Renders contextual assumption / risk notes as a stack of subtle info
 * cards. Yellow tone for `warning`, blue tone for `info`. Returns null
 * when there are no flags so the section gap collapses cleanly.
 */
export default function RiskFlags({ flags }: Props) {
  if (flags.length === 0) return null;

  return (
    <section
      aria-label="Assumptions to sanity-check"
      className="bg-white rounded-[var(--r-card)] p-5 md:p-6"
      style={{ boxShadow: 'var(--shadow-ring)' }}
    >
      <header className="mb-4 md:mb-5">
        <p className="eyebrow mb-1.5">Assumptions to sanity-check</p>
        <h3
          className="text-[1.05rem] md:text-[1.125rem] text-[color:var(--color-near-black)] tracking-[-0.012em] leading-[1.15]"
          style={{ fontWeight: 900 }}
        >
          What your inputs imply.
        </h3>
      </header>
      <ul className="flex flex-col gap-3">
        {flags.map((flag) => (
          <FlagCard key={flag.id} flag={flag} />
        ))}
      </ul>
    </section>
  );
}

function FlagCard({ flag }: { flag: RiskFlag }) {
  const isWarning = flag.tone === 'warning';
  return (
    <li
      className={`
        rounded-[var(--r-card-sm)] p-4 flex items-start gap-3
        ${isWarning
          ? 'bg-[#fffbe6] ring-1 ring-inset ring-[#f5d96e]/55'
          : 'bg-[#eaf4fb] ring-1 ring-inset ring-[#9ed0ee]/55'}
      `}
    >
      <span
        aria-hidden
        className={`flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full ${
          isWarning
            ? 'bg-[#f5d96e]/35 text-[#7a5c00]'
            : 'bg-[#9ed0ee]/35 text-[#0d4d77]'
        }`}
      >
        {isWarning ? (
          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
        ) : (
          <Info className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[13.5px] tracking-[-0.005em] ${
            isWarning ? 'text-[#5a4500]' : 'text-[#0d3a5a]'
          }`}
          style={{ fontWeight: 800 }}
        >
          {flag.title}
        </p>
        <p
          className={`text-[12.5px] font-medium leading-relaxed mt-1 ${
            isWarning ? 'text-[#6c5400]' : 'text-[#13507a]'
          }`}
        >
          {flag.body}
        </p>
      </div>
    </li>
  );
}
