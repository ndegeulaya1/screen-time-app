'use no memo';

import { useEffect, useRef } from 'react';

import { startLimitWatch } from '@/services/screen-time';
import { scheduleSleepMode } from '@/services/screen-time';
import { useLimitsStore } from '@/store/limits.store';
import { useSleepStore } from '@/store/sleep.store';
import { useStoreSelector } from '@/store/use-store-selector';
import { nextSleepWindow } from '@/utils/schedule';

export function useSyncNativeConfig(ready: boolean) {
  const didSync = useRef(false);
  const enabled = useStoreSelector(useSleepStore, (state) => state.enabled);
  const start = useStoreSelector(useSleepStore, (state) => state.start);
  const end = useStoreSelector(useSleepStore, (state) => state.end);
  const limits = useStoreSelector(useLimitsStore, (state) => state.limits);

  useEffect(() => {
    if (!ready || didSync.current) {
      return;
    }

    didSync.current = true;

    if (enabled) {
      const window = nextSleepWindow(start, end);
      scheduleSleepMode(window.startMs, window.endMs).catch(() => undefined);
    }

    for (const limit of limits) {
      if (limit.enabled) {
        startLimitWatch(limit.packageName, limit.limitMs).catch(() => undefined);
      }
    }
  }, [enabled, end, limits, ready, start]);
}
