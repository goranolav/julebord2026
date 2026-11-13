/**
 * localStorage wrapper that never throws. Write failures (quota exceeded, storage
 * disabled) are reported to subscribers so the UI can show a message instead of crashing.
 */

type ErrorListener = (key: string, error: unknown) => void;

const errorListeners = new Set<ErrorListener>();

export function onStorageError(listener: ErrorListener): () => void {
  errorListeners.add(listener);
  return () => errorListeners.delete(listener);
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Returns true on success. */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    errorListeners.forEach((listener) => listener(key, error));
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing useful to do; the value is simply left behind.
  }
}
