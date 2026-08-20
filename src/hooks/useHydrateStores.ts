'use no memo';

import { useEffect } from 'react';

import { useLimitsStore } from '@/store/limits.store';
import { useSettingsStore } from '@/store/settings.store';
import { useSleepStore } from '@/store/sleep.store';
import { useStoreSelector } from '@/store/use-store-selector';

export function useHydrateStores() {
  const sleepReady = useStoreSelector(useSleepStore, (state) => state.hydrated);
  const limitsReady = useStoreSelector(useLimitsStore, (state) => state.hydrated);
  const settingsReady = useStoreSelector(useSettingsStore, (state) => state.hydrated);
  const ready = sleepReady && limitsReady && settingsReady;

  useEffect(() => {
    void useSleepStore.getState().hydrate();
    void useLimitsStore.getState().hydrate();
    void useSettingsStore.getState().hydrate();
  }, []);

  return ready;
}
