import { useCallback, useSyncExternalStore } from 'react';

export const SOUND_KEY = 'jeopardy.sound.v1';

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) !== 'off';
}

/** Global, persisted sound on/off setting (on by default). */
export function useSoundEnabled(): [boolean, (enabled: boolean) => void] {
  const enabled = useSyncExternalStore(subscribe, readEnabled, () => true);
  const setEnabled = useCallback((value: boolean) => {
    localStorage.setItem(SOUND_KEY, value ? 'on' : 'off');
    listeners.forEach((listener) => listener());
  }, []);
  return [enabled, setEnabled];
}
