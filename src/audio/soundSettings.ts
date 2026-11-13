import { useCallback } from 'react';
import { createPersistedSetting } from '../storage/persistedSetting';

export const SOUND_KEY = 'jeopardy.sound.v1';

const soundSetting = createPersistedSetting(SOUND_KEY, 'on', ['on', 'off'] as const);

/** Global, persisted sound on/off setting (on by default). */
export function useSoundEnabled(): [boolean, (enabled: boolean) => void] {
  const [value, setValue] = soundSetting.useSetting();
  const setEnabled = useCallback((enabled: boolean) => setValue(enabled ? 'on' : 'off'), [setValue]);
  return [value === 'on', setEnabled];
}
