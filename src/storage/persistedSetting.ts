import { useCallback, useSyncExternalStore } from 'react';
import { safeGetItem, safeSetItem } from './safeStorage';

/**
 * Creates a React hook for a small persisted setting stored as a string in localStorage.
 * All hooks using the same setting stay in sync – also across browser tabs
 * (via the `storage` event), e.g. the answer sheet opened in a new tab.
 */
export function createPersistedSetting<T extends string>(key: string, defaultValue: T, allowed: readonly T[]) {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) notify();
  };

  function subscribe(listener: () => void): () => void {
    if (listeners.size === 0) window.addEventListener('storage', onStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener('storage', onStorage);
    };
  }

  function read(): T {
    const value = safeGetItem(key);
    return allowed.includes(value as T) ? (value as T) : defaultValue;
  }

  function write(value: T): void {
    safeSetItem(key, value);
    notify();
  }

  function useSetting(): [T, (value: T) => void] {
    const value = useSyncExternalStore(subscribe, read, () => defaultValue);
    const set = useCallback((next: T) => write(next), []);
    return [value, set];
  }

  return { useSetting, read, write };
}
