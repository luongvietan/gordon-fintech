import { Check, Minus } from 'lucide-react';

/**
 * Feature comparison table: MedDebt vs StudentLoanPlanner vs White Coat Investor.
 *
 * First-time visitors landing on the homepage are usually coming from a
 * Google search that also surfaced SLP and WCI — both are big, trusted
 * names in physician-finance content. This section makes the case for
 * *why* they should stay here rather than bouncing to check those out,
 * by laying out the concrete feature deltas side by side.
 *
 * We only claim features we actually have today (or that are objectively
 * present/absent on competitors as of 2025). If a claim here gets stale,
 * update it or drop the row — never bluff a ✓ we can't back up.
 */

type Cell =
  | { kind: 'yes'; detail?: string }
  | { kind: 'partial'; detail: string }
  | { kind: 'no' };

interface Row {
  feature: string;
  note?: string;
  meddebt: Cell;
  slp: Cell;
  wci: Cell;
}

const ROWS: Row[] = [
  {
    feature: 'Medical specialty presets',
    note: 'Auto-fill salary + training length',
    meddebt: { kind: 'yes', detail: '16 presets' },
    slp: { kind: 'no' },
    wci: { kind: 'no' },
  },
  {
    feature: 'Net-worth crossover visualization',
    note: 'Year your net worth turns positive',
    meddebt: { kind: 'yes' },
    slp: { kind: 'partial', detail: 'Payment schedule only' },
    wci: { kind: 'no' },
  },
  {
    feature: 'PSLF vs refinance vs aggressive, side-by-side',
    meddebt: { kind: 'yes' },
    slp: { kind: 'partial', detail: 'Paid consult' },
    wci: { kind: 'no' },
  },
  {
    feature: 'IDR tax-bomb modeling',
    note: 'Forgiveness as taxable income at year 20/25',
    meddebt: { kind: 'yes' },
    slp: { kind: 'partial', detail: 'Blog only' },
    wci: { kind: 'no' },
  },
  {
    feature: 'Residency + fellowship phase modeling',
    meddebt: { kind: 'yes' },
    slp: { kind: 'no' },
    wci: { kind: 'no' },
  },
  {
    feature: 'Free to use',
    meddebt: { kind: 'yes' },
    slp: { kind: 'partial', detail: '$595+ consult' },
    wci: { kind: 'yes' },
  },
  {
    feature: 'No email or signup required',
    meddebt: { kind: 'yes' },
    slp: { kind: 'no' },
    wci: { kind: 'yes' },
  },
  {
    feature: 'Runs fully in your browser',
    note: 'Inputs never leave your device',
    meddebt: { kind: 'yes' },
    slp: { kind: 'no' },
    wci: { kind: 'yes' },
  },
];

function CellRender({ cell }: { cell: Cell }) {
  if (cell.kind === 'yes') {
    return (
      <div className="inline-flex flex-col items-center gap-0.5">
        <span
          aria-label="Yes"
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]"
        >
          <Check className="w-3 h-3" strokeWidth={3} aria-hidden />
        </span>
        {cell.detail && (
          <span className="text-[10px] font-semibold text-[color:var(--color-dark-green)] tabular-nums">
            {cell.detail}
          </span>
        )}
      </div>
    );
  }
  if (cell.kind === 'partial') {
    return (
      <div className="inline-flex flex-col items-center gap-0.5">
        <span
          aria-label="Partial"
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fff4e6] text-[#b5651d] ring-1 ring-inset ring-[#e8a87c]/40"
        >
          <Minus className="w-3 h-3" strokeWidth={3} aria-hidden />
        </span>
        <span className="text-[10px] font-semibold text-[#7a3f0a] max-w-[96px] text-center leading-tight">
          {cell.detail}
        </span>
      </div>
    );
  }
  return (
    <span
      aria-label="No"
      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--color-near-black)]/[0.06] text-[color:var(--text-muted)]"
    >
      <span className="block w-2 h-[2px] rounded-full bg-current" />
    </span>
  );
}

export default function ComparisonMatrix() {
  return (
    <section
      aria-label="How MedDebt compares to other physician debt tools"
      className="py-14 md:py-20"
      style={{ background: 'var(--color-off-white)' }}
    >
      <div className="container">
        <div className="max-w-3xl mb-10 md:mb-12">
          <p className="eyebrow mb-4">How we compare</p>
          <h2
            className="display-section text-[color:var(--color-near-black)]"
            style={{ fontWeight: 900 }}
          >
            Built specifically for doctors &mdash; not generic student loans.
          </h2>
          <p className="mt-4 text-base md:text-lg text-[color:var(--text-secondary)] max-w-2xl font-medium">
            Student Loan Planner and The White Coat Investor are great for
            reading. When you actually need to model numbers for your
            specialty, residency length, and PSLF horizon, here&rsquo;s what
            you get.
          </p>
        </div>

        {/* ── Desktop table ───────────────────────────────── */}
        <div
          className="hidden md:block rounded-[var(--r-card)] bg-white overflow-hidden"
          style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
        >
          <table className="w-full text-[13.5px]">
            <thead className="bg-[color:var(--color-near-black)] text-white">
              <tr>
                <th className="text-left px-6 py-4 font-bold tracking-[-0.005em]">
                  Feature
                </th>
                <th className="px-4 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-wise-green)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-wise-green)]" />
                      This tool
                    </span>
                    <span className="text-[15px] font-black tracking-[-0.01em]">
                      MedDebt
                    </span>
                  </div>
                </th>
                <th className="px-4 py-4 text-[15px] font-bold tracking-[-0.01em] text-white/80">
                  Student&nbsp;Loan Planner
                </th>
                <th className="px-4 py-4 text-[15px] font-bold tracking-[-0.01em] text-white/80">
                  White Coat Investor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {ROWS.map((row) => (
                <tr key={row.feature} className="hover:bg-[color:var(--color-off-white)]/60">
                  <td className="px-6 py-4 align-top">
                    <p className="font-bold text-[color:var(--color-near-black)] leading-snug">
                      {row.feature}
                    </p>
                    {row.note && (
                      <p className="text-[11.5px] text-[color:var(--text-muted)] mt-0.5 font-medium">
                        {row.note}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center bg-[color:var(--color-light-mint)]/35">
                    <CellRender cell={row.meddebt} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <CellRender cell={row.slp} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <CellRender cell={row.wci} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile: stacked per-feature cards ───────────── */}
        <div className="md:hidden flex flex-col gap-3">
          {ROWS.map((row) => (
            <article
              key={row.feature}
              className="rounded-[var(--r-card-sm)] bg-white p-4"
              style={{ boxShadow: 'var(--shadow-ring)' }}
            >
              <p className="font-bold text-[color:var(--color-near-black)] leading-snug text-[15px]">
                {row.feature}
              </p>
              {row.note && (
                <p className="text-[12px] text-[color:var(--text-muted)] mt-0.5 font-medium">
                  {row.note}
                </p>
              )}
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                <MobileCell
                  label="MedDebt"
                  cell={row.meddebt}
                  highlight
                />
                <MobileCell label="SLP" cell={row.slp} />
                <MobileCell label="WCI" cell={row.wci} />
              </dl>
            </article>
          ))}
        </div>

        <p className="text-[11px] text-[color:var(--text-muted)] mt-6 font-medium max-w-2xl">
          Comparisons reflect publicly available features as of 2025. Student
          Loan Planner and White Coat Investor are independent brands, not
          affiliated with this site. No referral commissions; only display ads.
        </p>
      </div>
    </section>
  );
}

function MobileCell({
  label,
  cell,
  highlight = false,
}: {
  label: string;
  cell: Cell;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-[var(--r-card-sm)] p-2 ${
        highlight
          ? 'bg-[color:var(--color-light-mint)]'
          : 'bg-[color:var(--color-off-white)]'
      }`}
    >
      <dt
        className={`text-[10px] font-bold uppercase tracking-[0.10em] ${
          highlight ? 'text-[color:var(--color-dark-green)]' : 'text-[color:var(--text-muted)]'
        }`}
      >
        {label}
      </dt>
      <dd>
        <CellRender cell={cell} />
      </dd>
    </div>
  );
}
