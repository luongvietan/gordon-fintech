'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { CalculatorInputs, CalculatorOutputs } from '@/lib/calculator';

/**
 * Scenario save + compare (client-side only).
 *
 * Why localStorage and not URL-based sharing? The existing URL `?s=...`
 * system already works and is preserved: it's great for cross-device
 * ("send this link to your partner"). localStorage serves a different
 * need — letting a single visitor save 3-4 scenarios in one session
 * and compare them side by side on `/compare` without clobbering a
 * deep-linked URL. Both are intentionally kept as independent features.
 *
 * Privacy: nothing ever leaves the browser. `meddebt_scenarios` is only
 * readable by the same origin and only touched by this hook.
 */

const STORAGE_KEY = 'meddebt_scenarios';
const MAX_SCENARIOS = 12;

export interface SavedScenario {
  id: string;
  name: string;
  timestamp: number;
  inputs: CalculatorInputs;
  results: {
    payoffYears: number;
    standardTotalPaid: number;
    pslfSavings: number;
    netWorthCrossoverYear: number | null;
  };
}

function loadFromStorage(): SavedScenario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive: filter anything that doesn't look like a SavedScenario
    // shape. A single corrupt entry shouldn't wipe the whole list.
    return parsed.filter(
      (s): s is SavedScenario =>
        s &&
        typeof s === 'object' &&
        typeof s.id === 'string' &&
        typeof s.name === 'string' &&
        typeof s.timestamp === 'number' &&
        s.inputs &&
        s.results,
    );
  } catch {
    return [];
  }
}

function writeToStorage(scenarios: SavedScenario[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    // Storage quota exceeded or disabled — nothing useful we can do
    // here; UI will still reflect in-memory state until reload.
  }
}

// ── External store bridge ────────────────────────────────────
//
// localStorage is an external data source. React 19 disallows the
// `useEffect + setState` pattern for reading it, so we use
// `useSyncExternalStore` instead. A single in-module cache + listener
// set lets every consumer of this hook share the same snapshot and stay
// in sync when another tab or another hook call mutates the list.
let cachedSnapshot: SavedScenario[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): SavedScenario[] {
  if (cachedSnapshot === null) {
    cachedSnapshot = loadFromStorage();
  }
  return cachedSnapshot;
}

function getServerSnapshot(): SavedScenario[] {
  // On the server, we don't have access to localStorage and must render
  // a deterministic empty list. The client will re-render with the real
  // data on hydration.
  return EMPTY_LIST;
}
const EMPTY_LIST: SavedScenario[] = [];

function notify() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  // Also listen for cross-tab updates so a save in one tab refreshes
  // the compare view in another.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedSnapshot = loadFromStorage();
      notify();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function updateStore(next: SavedScenario[]) {
  cachedSnapshot = next;
  writeToStorage(next);
  notify();
}

// A tiny no-op store whose only purpose is to give `useSyncExternalStore`
// something to transition on. Server snapshot is `false`, client snapshot
// is `true`, so React returns `false` during SSR and the first hydrating
// render and flips to `true` immediately after commit — matching the old
// "setHydrated(true) in a mount effect" pattern without violating the
// `react-hooks/set-state-in-effect` rule.
const hydrationSubscribe = () => () => {};
const getHydrationClient = () => true;
const getHydrationServer = () => false;

export function useScenarioStorage() {
  const scenarios = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    hydrationSubscribe,
    getHydrationClient,
    getHydrationServer,
  );

  const persist = useCallback((next: SavedScenario[]) => {
    updateStore(next);
  }, []);

  const saveScenario = useCallback(
    (
      inputs: CalculatorInputs,
      outputs: CalculatorOutputs,
      name?: string,
    ): SavedScenario => {
      const nice = name?.trim();
      const autoName = `${formatSpecialtyTag(inputs)} · $${Math.round(
        inputs.attendingSalary / 1000,
      )}K · $${Math.round(inputs.totalDebt / 1000)}K debt`;
      const scenario: SavedScenario = {
        id: `sc_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 7)}`,
        name: nice || autoName,
        timestamp: Date.now(),
        inputs,
        results: {
          payoffYears: outputs.payoffYears,
          standardTotalPaid: outputs.standardTotalPaid,
          pslfSavings: outputs.pslfSavings,
          netWorthCrossoverYear: outputs.netWorthCrossoverYear,
        },
      };
      // Newest first; trim oldest once we pass the cap. We read the
      // current snapshot through `getSnapshot()` rather than closing over
      // the `scenarios` binding so callers don't see a stale list when
      // they save multiple times in rapid succession.
      const next = [scenario, ...getSnapshot()].slice(0, MAX_SCENARIOS);
      persist(next);
      return scenario;
    },
    [persist],
  );

  const renameScenario = useCallback(
    (id: string, name: string) => {
      persist(
        getSnapshot().map((s) =>
          s.id === id ? { ...s, name: name.trim() || s.name } : s,
        ),
      );
    },
    [persist],
  );

  const removeScenario = useCallback(
    (id: string) => {
      persist(getSnapshot().filter((s) => s.id !== id));
    },
    [persist],
  );

  const clearScenarios = useCallback(() => {
    persist([]);
  }, [persist]);

  return {
    scenarios,
    hydrated,
    saveScenario,
    renameScenario,
    removeScenario,
    clearScenarios,
  };
}

function formatSpecialtyTag(inputs: CalculatorInputs): string {
  // Best-effort auto-label. The calculator itself doesn't store the
  // specialty id on CalculatorInputs (it's derived via matching salary +
  // training), so we fall back to a training-phase shorthand that's
  // still human-readable.
  const years = inputs.residencyYears + (inputs.fellowshipYears ?? 0);
  const mod = inputs.pslfEnabled ? 'PSLF' : inputs.refinanceEnabled ? 'Refi' : 'Standard';
  return `${mod} · ${years}y training`;
}
