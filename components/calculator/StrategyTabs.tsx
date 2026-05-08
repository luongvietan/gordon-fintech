'use client';

import { useState } from 'react';
import { BarChart2, Target } from 'lucide-react';
import type { CalculatorInputs } from '@/lib/calculator';
import type { StrategyComparison as StrategyComparisonData } from '@/lib/calculator-scenarios';
import StrategyComparison from './StrategyComparison';
import PslfProgressTracker from '@/components/PslfProgressTracker';

type Tab = 'comparison' | 'tracker';

interface Props {
  comparison: StrategyComparisonData;
  inputs: CalculatorInputs;
  /** Kept for API compatibility — tracker tab is always shown regardless. */
  pslfEligible: boolean;
}

/**
 * Tab container for the strategy results area.
 *
 * Tab 1 — "Strategy Comparison": side-by-side table of all repayment paths.
 * Tab 2 — "PSLF Tracker": real-world progress tracker toward 120 qualifying
 *          payments and tax-free forgiveness. Always visible so users who are
 *          already making payments can track progress regardless of whether
 *          PSLF is toggled on in the calculator inputs.
 */
export default function StrategyTabs({ comparison, inputs }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('comparison');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'comparison',
      label: 'Strategy Comparison',
      icon: <BarChart2 aria-hidden className="w-3.5 h-3.5" strokeWidth={2} />,
    },
    {
      id: 'tracker',
      label: 'PSLF Tracker',
      icon: <Target aria-hidden className="w-3.5 h-3.5" strokeWidth={2} />,
    },
  ];

  return (
    <div>
      {/* Tab strip */}
      <div
        className="flex gap-1 p-1 rounded-[var(--r-pill)] bg-[color:var(--color-off-white)] mb-3 w-fit"
        role="tablist"
        aria-label="Strategy results view"
        style={{ boxShadow: 'var(--shadow-ring)' }}
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`strategy-panel-${t.id}`}
              id={`strategy-tab-${t.id}`}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-[calc(var(--r-pill)-2px)]
                text-[12px] font-bold transition-all duration-150
                ${isActive
                  ? 'bg-white text-[color:var(--color-near-black)] shadow-sm'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--color-near-black)]'}
              `}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panel: Strategy Comparison */}
      <div
        id="strategy-panel-comparison"
        role="tabpanel"
        aria-labelledby="strategy-tab-comparison"
        hidden={activeTab !== 'comparison'}
      >
        <StrategyComparison comparison={comparison} />
      </div>

      {/* Panel: PSLF Tracker */}
      <div
        id="strategy-panel-tracker"
        role="tabpanel"
        aria-labelledby="strategy-tab-tracker"
        hidden={activeTab !== 'tracker'}
      >
        <section
          aria-label="PSLF Progress Tracker"
          className="bg-white rounded-[var(--r-card)] overflow-hidden"
          style={{ boxShadow: 'var(--shadow-ring), var(--shadow-float)' }}
        >
          <header
            className="px-6 md:px-8 pt-6 md:pt-7 pb-4 border-b border-[color:var(--border-subtle)]"
            style={{ background: 'var(--color-near-black)' }}
          >
            <p className="eyebrow text-white/55 mb-2">Real-world tracking</p>
            <h3
              className="text-[1.25rem] md:text-[1.5rem] text-white tracking-[-0.018em] leading-[1.05]"
              style={{ fontWeight: 900 }}
            >
              PSLF Progress Tracker
            </h3>
            <p className="text-[13px] text-white/55 font-medium mt-2 leading-snug max-w-xl">
              Track your path to 120 qualifying payments and tax-free forgiveness.
              Distinct from the modeled PSLF projection above.
            </p>
          </header>

          <div className="p-6 md:p-8">
            <PslfProgressTracker inputs={inputs} />
          </div>
        </section>
      </div>
    </div>
  );
}
