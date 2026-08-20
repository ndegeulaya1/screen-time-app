'use no memo';

import { useCallback } from 'react';

import { cancelSleepMode, scheduleSleepMode } from '@/services/screen-time';
import { useSleepStore } from '@/store/sleep.store';
import { useStoreSelector } from '@/store/use-store-selector';
import { nextSleepWindow } from '@/utils/schedule';

export function useSleepSchedule() {
  const enabled = useStoreSelector(useSleepStore, (state) => state.enabled);
  const start = useStoreSelector(useSleepStore, (state) => state.start);
  const end = useStoreSelector(useSleepStore, (state) => state.end);
  const setSchedule = useStoreSelector(useSleepStore, (state) => state.setSchedule);

  const save = useCallback(
    async (next: { enabled: boolean; start: string; end: string }) => {
      await setSchedule(next);

      if (!next.enabled) {
        await cancelSleepMode();
        return;
      }

      const window = nextSleepWindow(next.start, next.end);
      await scheduleSleepMode(window.startMs, window.endMs);
    },
    [setSchedule],
  );

  return {
    enabled,
    start,
    end,
    save,
    nextWindow: enabled ? nextSleepWindow(start, end) : null,
  };
}
