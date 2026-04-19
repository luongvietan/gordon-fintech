'use client';

import { Users } from 'lucide-react';
import { comparePeerBenchmark, getPeerBenchmark } from '@/lib/peer-benchmarks';

interface Props {
  specialtyId?: string;
  attendingSalary: number;
  payoffYears: number;
  isPslf: boolean;
}

/**
 * Small "Doctors like you" inline benchmark note. Keeps the user honest
 * about what's typical for their specialty group without claiming their
 * personal projection is wrong — just contextualizes it.
 */
export default function PeerBenchmarkNote({
  specialtyId,
  attendingSalary,
  payoffYears,
  isPslf,
}: Props) {
  const benchmark = getPeerBenchmark(specialtyId, attendingSalary);
  const cmp = comparePeerBenchmark(benchmark, payoffYears, isPslf);

  const tone =
    cmp.status === 'on-track'
      ? { ring: 'ring-[color:var(--color-wise-green)]/40', dot: 'bg-[color:var(--color-wise-green)]' }
      : cmp.status === 'ahead'
      ? { ring: 'ring-[color:var(--color-wise-green)]/55', dot: 'bg-[color:var(--color-wise-green)]' }
      : { ring: 'ring-[#f5d96e]/55', dot: 'bg-[#f5b300]' };

  return (
    <aside
      aria-label="Peer benchmark"
      className={`rounded-[var(--r-card-sm)] bg-white px-4 py-3.5 ring-1 ring-inset ${tone.ring} flex items-start gap-3`}
    >
      <span
        aria-hidden
        className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]"
      >
        <Users className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            aria-hidden
            className={`w-1.5 h-1.5 rounded-full ${tone.dot}`}
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            Doctors like you
          </p>
        </div>
        <p className="text-[12.5px] md:text-[13px] text-[color:var(--text-secondary)] font-medium leading-relaxed">
          {cmp.sentence}
        </p>
        <p className="text-[10.5px] text-[color:var(--text-muted)] font-semibold mt-1.5">
          via {benchmark.source}
        </p>
      </div>
    </aside>
  );
}
