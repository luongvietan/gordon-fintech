'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookmarkPlus, Check, FolderOpen } from 'lucide-react';
import type { CalculatorInputs, CalculatorOutputs } from '@/lib/calculator';
import { useScenarioStorage } from '@/hooks/useScenarioStorage';
import { trackScenarioSaved } from '@/lib/analytics';

interface Props {
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
}

/**
 * Save-the-current-scenario button + a link to `/compare`.
 *
 * Deliberately kept narrow in scope: just saves, never edits. Renaming
 * and deleting live on the compare page, which is the one place users
 * actually need them — the sidebar header should stay compact.
 */
export default function SaveScenarioButton({ inputs, outputs }: Props) {
  const { scenarios, hydrated, saveScenario } = useScenarioStorage();
  const [state, setState] = useState<'idle' | 'saved'>('idle');

  function handleClick() {
    saveScenario(inputs, outputs);
    trackScenarioSaved({
      total: scenarios.length + 1,
      pslf_enabled: !!inputs.pslfEnabled,
      loan_type: inputs.loanType,
    });
    setState('saved');
    setTimeout(() => setState('idle'), 1800);
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Save this scenario to your browser for side-by-side comparison later"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--r-pill)] text-xs font-bold bg-white text-[color:var(--color-near-black)] ring-1 ring-inset ring-[color:var(--border-default)] transition-all duration-200 hover:scale-[1.04] hover:ring-[color:var(--border-strong)] active:scale-[0.96]"
      >
        {state === 'saved' ? (
          <Check aria-hidden="true" className="w-3 h-3" strokeWidth={2.5} />
        ) : (
          <BookmarkPlus aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
        )}
        {state === 'saved' ? 'Saved' : 'Save scenario'}
      </button>
      {hydrated && scenarios.length > 0 && (
        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--r-pill)] text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          aria-label={`Compare your ${scenarios.length} saved scenarios side by side`}
        >
          <FolderOpen aria-hidden="true" className="w-3 h-3" strokeWidth={2} />
          Compare ({scenarios.length})
        </Link>
      )}
    </div>
  );
}
