'use client';

import { useSyncExternalStore } from 'react';

/**
 * Tiny local-only toggle for "expert mode" on the calculator form.
 *
 * Beginner (default):
 *   - Career / Loan / Strategy / Assumptions sections only.
 *   - Every other knob ships hidden so first-time visitors aren't
 *     overwhelmed by refi + job-change + household + per-PGY overrides.
 * Expert:
 *   - Every section visible. Enabled via a single toggle button.
 *
 * Persistence is localStorage-backed so a user who enables expert mode
 * doesn't have to re-enable it every time. We use the same
 * `useSyncExternalStore` pattern as `useScenarioStorage` to stay SSR-
 * and React 19 strict-mode-safe. Nothing PII, nothing cross-origin.
 */

const STORAGE_KEY = 'meddebt_expert_mode';

let cachedValue: boolean | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeToStorage(v: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
  } catch {
    // ignore quota / disabled storage
  }
}

function getSnapshot(): boolean {
  if (cachedValue === null) cachedValue = readFromStorage();
  return cachedValue;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedValue = readFromStorage();
      for (const l of listeners) l();
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

export function useExpertMode(): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setValue = (v: boolean) => {
    cachedValue = v;
    writeToStorage(v);
    for (const l of listeners) l();
  };
  return [value, setValue];
}
